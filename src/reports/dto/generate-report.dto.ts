import { IsEnum, IsOptional, IsDateString, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PqrsdType } from '../../common/enums/pqrsd-type.enum';
import { PqrsdStatus } from '../../common/enums/pqrsd-status.enum';

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
}

export class GenerateReportDto {
  @ApiProperty({
    description: 'Formato del reporte',
    enum: ReportFormat,
    example: ReportFormat.PDF,
  })
  @IsEnum(ReportFormat, { message: 'Formato de reporte no válido' })
  format: ReportFormat;

  @ApiProperty({
    description: 'Fecha de inicio',
    example: '2024-01-01',
  })
  @IsDateString({}, { message: 'Fecha de inicio no válida' })
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin',
    example: '2024-12-31',
  })
  @IsDateString({}, { message: 'Fecha de fin no válida' })
  endDate: string;

  @ApiProperty({
    description: 'Tipos de PQRSD a incluir',
    enum: PqrsdType,
    isArray: true,
    required: false,
  })
  @IsArray()
  @IsEnum(PqrsdType, { each: true, message: 'Tipo de PQRSD no válido' })
  @IsOptional()
  types?: PqrsdType[];

  @ApiProperty({
    description: 'Estados a incluir',
    enum: PqrsdStatus,
    isArray: true,
    required: false,
  })
  @IsArray()
  @IsEnum(PqrsdStatus, { each: true, message: 'Estado no válido' })
  @IsOptional()
  statuses?: PqrsdStatus[];

  @ApiProperty({
    description: 'IDs de departamentos a incluir',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsUUID(4, { each: true, message: 'ID de departamento no válido' })
  @IsOptional()
  departmentIds?: string[];
}