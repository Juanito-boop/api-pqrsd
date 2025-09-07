import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PqrsdService } from './pqrsd.service';
import { PqrsdController } from './pqrsd.controller';
import { PqrsdRequest } from '../entities/pqrsd-request.entity';
import { PqrsdComment } from '../entities/pqrsd-comment.entity';
import { PqrsdAttachment } from '../entities/pqrsd-attachment.entity';
import { PqrsdStatusHistory } from '../entities/pqrsd-status-history.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PqrsdRequest,
      PqrsdComment,
      PqrsdAttachment,
      PqrsdStatusHistory,
    ]),
  NotificationsModule,
  ],
  controllers: [PqrsdController],
  providers: [PqrsdService],
  exports: [PqrsdService],
})
export class PqrsdModule {}