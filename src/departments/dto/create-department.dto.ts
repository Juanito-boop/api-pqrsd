import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Nombre del departamento',
    example: 'Servicio al Cliente',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiProperty({
    description: 'Descripción del departamento',
    example: 'Departamento encargado de la atención al cliente',
    required: false,
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'ID del gerente del departamento',
    example: 'uuid-v4',
    required: false,
  })
  @IsUUID(4, { message: 'ID del gerente no válido' })
  @IsOptional()
  managerId?: string;
}