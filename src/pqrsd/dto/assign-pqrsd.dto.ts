import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPqrsdDto {
  @ApiProperty({
    description: 'ID del departamento asignado',
    example: 'uuid-v4',
    required: false,
  })
  @IsUUID(4, { message: 'ID del departamento no válido' })
  @IsOptional()
  departmentId?: string;

  @ApiProperty({
    description: 'ID del usuario asignado',
    example: 'uuid-v4',
    required: false,
  })
  @IsUUID(4, { message: 'ID del usuario no válido' })
  @IsOptional()
  userId?: string;
}