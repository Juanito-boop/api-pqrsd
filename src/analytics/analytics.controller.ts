import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Métricas del dashboard principal' })
  @ApiResponse({
    status: 200,
    description: 'Métricas del dashboard',
  })
  getDashboardMetrics(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getDashboardMetrics(query);
  }

  @Get('monthly')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Estadísticas mensuales' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas mensuales de PQRSD',
  })
  getMonthlyStats(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getMonthlyStats(query);
  }

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Resumen del dashboard (formato frontend)' })
  @ApiResponse({
    status: 200,
    description: 'Resumen con campos: total, pendientes, resueltas, vencidas, esteMes, tiempoPromedio',
  })
  getDashboardSummary(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getDashboardSummary(query);
  }

  @Get('by-type')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Estadísticas por tipo de PQRSD' })
  @ApiResponse({
    status: 200,
    description: 'Distribución por tipo de PQRSD',
  })
  getStatsByType(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getStatsByType(query);
  }

  @Get('by-department')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Estadísticas por departamento' })
  @ApiResponse({
    status: 200,
    description: 'Rendimiento por departamento',
  })
  getStatsByDepartment(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getStatsByDepartment(query);
  }

  @Get('performance')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Métricas de rendimiento' })
  @ApiResponse({
    status: 200,
    description: 'Indicadores de rendimiento del sistema',
  })
  getPerformanceMetrics(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getPerformanceMetrics(query);
  }
}