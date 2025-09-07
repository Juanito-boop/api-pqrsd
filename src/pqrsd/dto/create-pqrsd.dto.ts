import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PqrsdType } from '../../common/enums/pqrsd-type.enum';
import { PetitionerType } from '../../common/enums/petitioner-type.enum';
import { IdType } from '../../common/enums/id-type.enum';
import { Priority } from '../../common/enums/priority.enum';

export class CreatePqrsdDto {
  @ApiProperty({ description: 'Tipo de PQRSD', enum: PqrsdType, example: PqrsdType.PETICION })
  @IsEnum(PqrsdType, { message: 'Tipo de PQRSD no válido' })
  @IsNotEmpty({ message: 'El tipo es obligatorio' })
  type: PqrsdType;

  @ApiProperty({ description: 'Asunto de la PQRSD', example: 'Solicitud de información sobre servicios', maxLength: 255 })
  @IsString({ message: 'El asunto debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El asunto es obligatorio' })
  @MaxLength(255, { message: 'El asunto no puede exceder 255 caracteres' })
  subject: string;

  @ApiProperty({ description: 'Descripción detallada de la PQRSD', example: 'Solicito información detallada sobre...' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description: string;

  @ApiProperty({ description: 'Tipo de peticionario', enum: PetitionerType, example: PetitionerType.PERSONA_NATURAL })
  @IsEnum(PetitionerType, { message: 'Tipo de peticionario no válido' })
  @IsNotEmpty({ message: 'El tipo de peticionario es obligatorio' })
  petitionerType: PetitionerType;

  @ApiProperty({ description: 'Nombre del peticionario', example: 'Juan Pérez' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  petitionerName: string;

  @ApiProperty({ description: 'Email del peticionario', example: 'juan.perez@email.com' })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  petitionerEmail: string;

  @ApiProperty({ description: 'Teléfono del peticionario', example: '+57 300 123 4567' })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  petitionerPhone: string;

  @ApiProperty({ description: 'Dirección del peticionario', example: 'Calle 123 #45-67, Bogotá' })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  petitionerAddress: string;

  @ApiProperty({ description: 'Tipo de documento de identificación', enum: IdType, example: IdType.CEDULA })
  @IsEnum(IdType, { message: 'Tipo de documento no válido' })
  @IsNotEmpty({ message: 'El tipo de documento es obligatorio' })
  petitionerIdType: IdType;

  @ApiProperty({ description: 'Número de documento de identificación', example: '12345678' })
  @IsString({ message: 'El número de documento debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  petitionerIdNumber: string;

  @ApiProperty({ description: 'Prioridad de la PQRSD', enum: Priority, example: Priority.MEDIA, required: false })
  @IsEnum(Priority, { message: 'Prioridad no válida' })
  @IsOptional()
  priority?: Priority;
}