import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { PqrsdRequest } from '../entities/pqrsd-request.entity';
import { Department } from '../entities/department.entity';
import { User } from '../entities/user.entity';
import { GenerateReportDto, ReportFormat } from './dto/generate-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(PqrsdRequest)
    private pqrsdRepository: Repository<PqrsdRequest>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async generateReport(generateReportDto: GenerateReportDto): Promise<any> {
    const whereClause = this.buildReportWhereClause(generateReportDto);

    const data = await this.pqrsdRepository.find({
      where: whereClause,
      relations: ['assignedDepartment', 'assignedUser'],
      order: { createdAt: 'DESC' },
    });

    const summary = await this.generateSummary(data);

    const reportData = {
      title: 'Reporte PQRSD',
      period: `${generateReportDto.startDate} - ${generateReportDto.endDate}`,
      generatedAt: new Date().toISOString(),
      summary,
      data: data.map(item => ({
        filingNumber: item.filingNumber,
        type: item.type,
        subject: item.subject,
        status: item.status,
        priority: item.priority,
        petitionerName: item.petitionerName,
        assignedDepartment: item.assignedDepartment?.name || 'Sin asignar',
        assignedUser: item.assignedUser ? 
          `${item.assignedUser.firstName} ${item.assignedUser.lastName}` : 
          'Sin asignar',
        createdAt: item.createdAt,
        dueDate: item.dueDate,
        responseDate: item.responseDate,
      })),
    };

    if (generateReportDto.format === ReportFormat.PDF) {
      return this.generatePDF(reportData);
    } else {
      return this.generateExcel(reportData);
    }
  }

  async getReportTemplates() {
    return [
      {
        id: 'monthly-summary',
        name: 'Resumen Mensual',
        description: 'Estadísticas generales del mes',
        defaultFilters: {
          period: 'current_month',
          includeAll: true,
        },
      },
      {
        id: 'departmental-performance',
        name: 'Rendimiento Departamental',
        description: 'Análisis por departamento',
        defaultFilters: {
          groupBy: 'department',
          includeMetrics: true,
        },
      },
      {
        id: 'overdue-requests',
        name: 'Solicitudes Vencidas',
        description: 'PQRSD que han superado el tiempo límite',
        defaultFilters: {
          status: ['recibida', 'en_proceso', 'asignada'],
          overdue: true,
        },
      },
    ];
  }

  async exportReport(generateReportDto: GenerateReportDto): Promise<Buffer> {
    const reportData = await this.generateReport(generateReportDto);
    
    if (generateReportDto.format === ReportFormat.PDF) {
      return this.generatePDFBuffer(reportData);
    } else {
      return this.generateExcelBuffer(reportData);
    }
  }

  private buildReportWhereClause(dto: GenerateReportDto) {
    const where: any = {
      createdAt: Between(new Date(dto.startDate), new Date(dto.endDate)),
    };

    if (dto.types && dto.types.length > 0) {
      where.type = In(dto.types);
    }

    if (dto.statuses && dto.statuses.length > 0) {
      where.status = In(dto.statuses);
    }

    if (dto.departmentIds && dto.departmentIds.length > 0) {
      where.assignedDepartmentId = In(dto.departmentIds);
    }

    return where;
  }

  private async generateSummary(data: PqrsdRequest[]) {
    const total = data.length;
    const byType = {};
    const byStatus = {};
    
    data.forEach(item => {
      byType[item.type] = (byType[item.type] || 0) + 1;
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    });

    const closed = data.filter(item => item.status === 'cerrada').length;
    const overdue = data.filter(item => 
      new Date() > item.dueDate && item.status !== 'cerrada'
    ).length;

    return {
      total,
      closed,
      overdue,
      responseRate: total > 0 ? (closed / total) * 100 : 0,
      byType,
      byStatus,
    };
  }

  private generatePDF(data: any): any {
    // En una implementación real, usarías una librería como PDFKit
    return {
      type: 'pdf',
      filename: `reporte-pqrsd-${Date.now()}.pdf`,
      data: data,
      message: 'PDF generation would be implemented here',
    };
  }

  private generateExcel(data: any): any {
    // En una implementación real, usarías una librería como ExcelJS
    return {
      type: 'excel',
      filename: `reporte-pqrsd-${Date.now()}.xlsx`,
      data: data,
      message: 'Excel generation would be implemented here',
    };
  }

  private generatePDFBuffer(data: any): Buffer {
    // Implementación real de PDF buffer
    return Buffer.from(JSON.stringify(data));
  }

  private generateExcelBuffer(data: any): Buffer {
    // Implementación real de Excel buffer
    return Buffer.from(JSON.stringify(data));
  }
}