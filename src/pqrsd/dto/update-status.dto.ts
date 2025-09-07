import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PqrsdStatus } from '../../common/enums/pqrsd-status.enum';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la PQRSD',
    enum: PqrsdStatus,
    example: PqrsdStatus.EN_PROCESO,
  })
  @IsEnum(PqrsdStatus, { message: 'Estado no válido' })
  status: PqrsdStatus;

  @ApiProperty({
    description: 'Razón del cambio de estado',
    example: 'Se inicia proceso de revisión',
    required: false,
  })
  @IsString({ message: 'La razón debe ser una cadena de texto' })
  @IsOptional()
  reason?: string;
}