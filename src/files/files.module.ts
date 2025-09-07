import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { PqrsdAttachment } from '../entities/pqrsd-attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PqrsdAttachment]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.get<string>('UPLOAD_PATH', './uploads'),
          filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
          },
        }),
        limits: {
          fileSize: configService.get<number>('MAX_FILE_SIZE', 10 * 1024 * 1024), // 10MB
        },
        fileFilter: (req, file, callback) => {
          const allowedTypes = configService.get<string>('ALLOWED_FILE_TYPES', 'pdf,doc,docx,jpg,jpeg,png');
          const allowedExtensions = allowedTypes.split(',');
          const fileExt = extname(file.originalname).substring(1).toLowerCase();
          
          if (allowedExtensions.includes(fileExt)) {
            callback(null, true);
          } else {
            callback(new Error(`Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes}`), false);
          }
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}