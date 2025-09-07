import { IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PqrsdType } from '../../common/enums/pqrsd-type.enum';
import { PqrsdStatus } from '../../common/enums/pqrsd-status.enum';
import { Priority } from '../../common/enums/priority.enum';

export class PqrsdQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ enum: PqrsdType, required: false })
  @IsOptional()
  @IsEnum(PqrsdType)
  type?: PqrsdType;

  @ApiProperty({ enum: PqrsdStatus, required: false })
  @IsOptional()
  @IsEnum(PqrsdStatus)
  status?: PqrsdStatus;

  @ApiProperty({ enum: Priority, required: false })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  assignedDepartmentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  assignedUserId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  createdTo?: string;
}