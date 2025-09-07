import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { PqrsdRequest } from '../entities/pqrsd-request.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PqrsdRequest, User])],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}