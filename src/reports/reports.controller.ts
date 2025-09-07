import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { GenerateReportDto, ReportFormat } from './dto/generate-report.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Reportes')
@Controller('reports')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Generar reporte personalizado' })
  @ApiResponse({
    status: 201,
    description: 'Reporte generado exitosamente',
  })
  generate(@Body() generateReportDto: GenerateReportDto) {
    return this.reportsService.generateReport(generateReportDto);
  }

  @Get('templates')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Obtener plantillas de reportes disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de plantillas de reportes',
  })
  getTemplates() {
    return this.reportsService.getReportTemplates();
  }

  @Post('export')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Exportar reporte como archivo' })
  @ApiResponse({
    status: 200,
    description: 'Archivo de reporte exportado',
  })
  async exportReport(
    @Body() generateReportDto: GenerateReportDto,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportReport(generateReportDto);
    
    const filename = `reporte-pqrsd-${Date.now()}.${generateReportDto.format === ReportFormat.PDF ? 'pdf' : 'xlsx'}`;
    const mimeType = generateReportDto.format === ReportFormat.PDF ? 
      'application/pdf' : 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}