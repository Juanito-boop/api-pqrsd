import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PqrsdRequest } from '../entities/pqrsd-request.entity';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { PqrsdType } from '../common/enums/pqrsd-type.enum';
import { PqrsdStatus } from '../common/enums/pqrsd-status.enum';
import { Priority } from '../common/enums/priority.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(PqrsdRequest)
    private pqrsdRepository: Repository<PqrsdRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async getDashboardMetrics(query: AnalyticsQueryDto) {
    const whereClause = this.buildWhereClause(query);

    const [
      totalRequests,
      activeRequests,
      closedRequests,
      overdue,
    ] = await Promise.all([
      this.pqrsdRepository.count({ where: whereClause }),
      this.pqrsdRepository.count({
        where: {
          ...whereClause,
          status: PqrsdStatus.EN_PROCESO,
        },
      }),
      this.pqrsdRepository.count({
        where: {
          ...whereClause,
          status: PqrsdStatus.CERRADA,
        },
      }),
      this.getOverdueCount(whereClause),
    ]);

    const avgResponseTime = await this.getAverageResponseTime(whereClause);

    return {
      totalRequests,
      activeRequests,
      closedRequests,
      overdue,
      avgResponseTime,
      responseRate: totalRequests > 0 ? (closedRequests / totalRequests) * 100 : 0,
    };
  }

  /**
   * New helper that returns the dashboard summary with the keys the frontend expects
   * Fields: total, pendientes, resueltas, vencidas, esteMes, tiempoPromedio
   */
  async getDashboardSummary(query: AnalyticsQueryDto) {
    const whereClause = this.buildWhereClause(query);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [total, pendientes, resueltas, vencidas, esteMes, avgDays] = await Promise.all([
      this.pqrsdRepository.count({ where: whereClause }),
      // pendientes: not closed
      this.pqrsdRepository.count({ where: { ...whereClause, status: PqrsdStatus.EN_PROCESO } }),
      // resueltas: closed
      this.pqrsdRepository.count({ where: { ...whereClause, status: PqrsdStatus.CERRADA } }),
      // vencidas: dueDate < now and not closed
      this.pqrsdRepository.count({ where: { ...whereClause, dueDate: Between(new Date('1900-01-01'), now), status: PqrsdStatus.EN_PROCESO } }),
      // esteMes: created_at between startOfMonth and endOfMonth
      this.pqrsdRepository.count({ where: { ...whereClause, createdAt: Between(startOfMonth, endOfMonth) } }),
      // average response time in days
      this.getAverageResponseTime(whereClause),
    ]);

    const tiempoPromedio = avgDays ? parseFloat(avgDays.toFixed(1)) : 0;

    return {
      total,
      pendientes,
      resueltas,
      vencidas,
      esteMes,
      tiempoPromedio,
    };
  }

  async getMonthlyStats(query: AnalyticsQueryDto) {
    const whereClause = this.buildWhereClause(query);

    const monthlyData = await this.pqrsdRepository
      .createQueryBuilder('pqrsd')
      .select([
        'EXTRACT(YEAR FROM pqrsd.created_at) as year',
        'EXTRACT(MONTH FROM pqrsd.created_at) as month',
        'COUNT(*) as total',
        'COUNT(CASE WHEN pqrsd.status = :closedStatus THEN 1 END) as closed',
      ])
      .where(whereClause)
      .setParameters({ closedStatus: PqrsdStatus.CERRADA })
      .groupBy('EXTRACT(YEAR FROM pqrsd.created_at), EXTRACT(MONTH FROM pqrsd.created_at)')
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'DESC')
      .limit(12)
      .getRawMany();

    return monthlyData.map(item => ({
      year: parseInt(item.year),
      month: parseInt(item.month),
      total: parseInt(item.total),
      closed: parseInt(item.closed),
      responseRate: item.total > 0 ? (item.closed / item.total) * 100 : 0,
    }));
  }

  async getStatsByType(query: AnalyticsQueryDto) {
    const whereClause = this.buildWhereClause(query);

    const typeStats = await this.pqrsdRepository
      .createQueryBuilder('pqrsd')
      .select([
        'pqrsd.type as type',
        'COUNT(*) as total',
        'COUNT(CASE WHEN pqrsd.status = :closedStatus THEN 1 END) as closed',
        'AVG(CASE WHEN pqrsd.response_date IS NOT NULL THEN EXTRACT(EPOCH FROM (pqrsd.response_date - pqrsd.created_at))/86400 END) as avg_response_days',
      ])
      .where(whereClause)
      .setParameters({ closedStatus: PqrsdStatus.CERRADA })
      .groupBy('pqrsd.type')
      .getRawMany();

    return typeStats.map(item => ({
      type: item.type,
      total: parseInt(item.total),
      closed: parseInt(item.closed),
      pending: parseInt(item.total) - parseInt(item.closed),
      responseRate: item.total > 0 ? (item.closed / item.total) * 100 : 0,
      avgResponseDays: item.avg_response_days ? parseFloat(item.avg_response_days).toFixed(1) : null,
    }));
  }

  async getStatsByDepartment(query: AnalyticsQueryDto) {
    const whereClause = this.buildWhereClause(query);

    const departmentStats = await this.pqrsdRepository
      .createQueryBuilder('pqrsd')
      .leftJoin('pqrsd.assignedDepartment', 'department')
      .select([
        'department.name as department_name',
        'COUNT(*) as total',
        'COUNT(CASE WHEN pqrsd.status = :closedStatus THEN 1 END) as closed',
        'AVG(CASE WHEN pqrsd.response_date IS NOT NULL THEN EXTRACT(EPOCH FROM (pqrsd.response_date - pqrsd.created_at))/86400 END) as avg_response_days',
      ])
      .where(whereClause)
      .andWhere('pqrsd.assignedDepartmentId IS NOT NULL')
      .setParameters({ closedStatus: PqrsdStatus.CERRADA })
      .groupBy('department.name')
      .getRawMany();

    return departmentStats.map(item => ({
      departmentName: item.department_name || 'Sin asignar',
      total: parseInt(item.total),
      closed: parseInt(item.closed),
      pending: parseInt(item.total) - parseInt(item.closed),
      responseRate: item.total > 0 ? (item.closed / item.total) * 100 : 0,
      avgResponseDays: item.avg_response_days ? parseFloat(item.avg_response_days).toFixed(1) : null,
    }));
  }

  async getPerformanceMetrics(query: AnalyticsQueryDto) {
    const whereClause = this.buildWhereClause(query);
    const now = new Date();

    const [
      totalVolume,
      onTimeResponses,
      overdueCount,
      avgResolutionTime,
    ] = await Promise.all([
      this.pqrsdRepository.count({ where: whereClause }),
      this.pqrsdRepository.count({
        where: {
          ...whereClause,
          status: PqrsdStatus.CERRADA,
        },
      }),
      this.getOverdueCount(whereClause),
      this.getAverageResponseTime(whereClause),
    ]);

    const complianceRate = totalVolume > 0 ? ((totalVolume - overdueCount) / totalVolume) * 100 : 0;

    return {
      totalVolume,
      onTimeResponses,
      overdueCount,
      avgResolutionTime,
      complianceRate,
    };
  }

  private buildWhereClause(query: AnalyticsQueryDto) {
    const where: any = {};

    if (query.startDate && query.endDate) {
      where.createdAt = Between(
        new Date(query.startDate),
        new Date(query.endDate),
      );
    } else if (query.startDate) {
      where.createdAt = Between(
        new Date(query.startDate),
        new Date(),
      );
    }

    if (query.departmentId) {
      where.assignedDepartmentId = query.departmentId;
    }

    return where;
  }

  private async getOverdueCount(whereClause: any): Promise<number> {
    const now = new Date();
    
    return this.pqrsdRepository.count({
      where: {
        ...whereClause,
        dueDate: Between(new Date('1900-01-01'), now),
        status: PqrsdStatus.CERRADA,
      },
    });
  }

  private async getAverageResponseTime(whereClause: any): Promise<number> {
    const result = await this.pqrsdRepository
      .createQueryBuilder('pqrsd')
      .select('AVG(EXTRACT(EPOCH FROM (pqrsd.response_date - pqrsd.created_at))/86400)', 'avg_days')
      .where(whereClause)
      .andWhere('pqrsd.responseDate IS NOT NULL')
      .getRawOne();

    return result.avg_days ? parseFloat(result.avg_days) : 0;
  }
}