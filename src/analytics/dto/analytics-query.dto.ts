import { IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsQueryDto {
  @ApiProperty({
    description: 'Fecha de inicio para el rango de análisis',
    example: '2024-01-01',
    required: false,
  })
  @IsDateString({}, { message: 'Fecha de inicio no válida' })
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de fin para el rango de análisis',
    example: '2024-12-31',
    required: false,
  })
  @IsDateString({}, { message: 'Fecha de fin no válida' })
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'ID del departamento para filtrar',
    example: 'uuid-v4',
    required: false,
  })
  @IsUUID(4, { message: 'ID del departamento no válido' })
  @IsOptional()
  departmentId?: string;
}