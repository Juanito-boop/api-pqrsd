import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
    required: false,
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Nombres del usuario',
    example: 'Juan Carlos',
    required: false,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Apellidos del usuario',
    example: 'Pérez García',
    required: false,
  })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    example: UserRole.OPERATOR,
    required: false,
  })
  @IsEnum(UserRole, { message: 'Rol de usuario no válido' })
  @IsOptional()
  role?: UserRole;

  @ApiProperty({
    description: 'ID del departamento al que pertenece',
    example: 'uuid-v4',
    required: false,
  })
  @IsUUID(4, { message: 'ID del departamento no válido' })
  @IsOptional()
  departmentId?: string;

  @ApiProperty({
    description: 'Estado activo del usuario',
    example: true,
    required: false,
  })
  @IsBoolean({ message: 'El estado activo debe ser un booleano' })
  @IsOptional()
  isActive?: boolean;
}