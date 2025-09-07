import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Contenido del comentario',
    example: 'Se ha revisado la documentación adjunta...',
  })
  @IsString({ message: 'El comentario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El comentario es obligatorio' })
  comment: string;

  @ApiProperty({
    description: 'Indica si el comentario es interno (solo visible para funcionarios)',
    example: true,
    required: false,
    default: false,
  })
  @IsBoolean({ message: 'isInternal debe ser un booleano' })
  @IsOptional()
  isInternal?: boolean = false;
}