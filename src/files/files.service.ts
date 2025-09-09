import { Injectable, NotFoundException, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PqrsdAttachment } from '../entities/pqrsd-attachment.entity';
import { PqrsdRequest } from '../entities/pqrsd-request.entity';
import { Client as MinioClient } from 'minio';
import { createReadStream, promises as fsPromises } from 'fs';
import { extname } from 'path';

@Injectable()
export class FilesService implements OnModuleInit {
  private minioClient: MinioClient;
  private bucket: string;

  constructor(
    @InjectRepository(PqrsdAttachment)
    private attachmentRepository: Repository<PqrsdAttachment>,
    @InjectRepository(PqrsdRequest)
    private pqrsdRepository: Repository<PqrsdRequest>,
  ) {
    const endPoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = parseInt(process.env.MINIO_PORT || '9000', 10);
    const useSSL = (process.env.MINIO_USE_SSL || 'false') === 'true';
    const accessKey = process.env.MINIO_ACCESS_KEY || 'admin';
    const secretKey = process.env.MINIO_SECRET_KEY || 'admin123';
    this.bucket = process.env.MINIO_BUCKET || 'pqrsd';

    this.minioClient = new MinioClient({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    // We defer connection verification to onModuleInit so Nest can fail fast
  }

  async onModuleInit(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucket, 'us-east-1');
      }
    } catch (err) {
      // If MinIO is not reachable, throw to prevent app initialization
      // eslint-disable-next-line no-console
      console.error('MinIO connectivity check failed:', err);
      throw new InternalServerErrorException('No se pudo conectar al servicio de almacenamiento (MinIO).');
    }
  }

  /**
   * Contract:
   * - input: pqrsdId, array of multer files (with .path or .buffer)
   * - output: saved PqrsdAttachment[] metadata
   * - errors: throws InternalServerErrorException on upload failure
   */
  async uploadFiles(pqrsdId: string, files: Express.Multer.File[]): Promise<PqrsdAttachment[]> {
    // Buscar la PQRSD para obtener el filingNumber
    const pqrsd = await this.pqrsdRepository.findOne({ where: { id: pqrsdId } });
    if (!pqrsd) {
      throw new NotFoundException('PQRSD no encontrada');
    }

    const folderName = pqrsd.filingNumber; // Usar filingNumber como nombre de carpeta
    const savedAttachments: PqrsdAttachment[] = [];

    for (const file of files) {
      // Determine object name: filingNumber/timestamp-random-ext
      const ext = extname(file.originalname) || '';
      const objectName = `${folderName}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

      try {
        if (file.buffer) {
          await this.putObjectFromBuffer(objectName, file.buffer, file.mimetype);
        } else if (file.path) {
          await this.putObjectFromPath(objectName, file.path, file.mimetype);
        } else {
          throw new InternalServerErrorException('Archivo inválido: no tiene buffer ni path');
        }
      } catch (err) {
        throw new InternalServerErrorException('Error subiendo archivo a almacenamiento');
      }

      const attachment = this.attachmentRepository.create({
        pqrsdId,
        filename: objectName,
        originalName: file.originalname,
        filePath: objectName, // store object key
        fileSize: file.size,
        mimeType: file.mimetype,
      });

      const saved = await this.attachmentRepository.save(attachment);
      savedAttachments.push(saved);
    }

    return savedAttachments;
  }

  async getAttachmentsByPqrsd(pqrsdId: string): Promise<PqrsdAttachment[]> {
    return this.attachmentRepository.find({
      where: { pqrsdId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAttachment(id: string): Promise<PqrsdAttachment> {
    const attachment = await this.attachmentRepository.findOne({ where: { id } });

    if (!attachment) {
      throw new NotFoundException('Archivo no encontrado');
    }

    return attachment;
  }

  /**
   * Returns a presigned URL to download the file from MinIO (expires in seconds)
   */
  async getDownloadUrl(id: string, expiresSeconds = 60): Promise<string> {
    const attachment = await this.getAttachment(id);

    try {
      const url = await this.minioClient.presignedGetObject(this.bucket, attachment.filePath, expiresSeconds);
      return url;
    } catch (err) {
      throw new InternalServerErrorException('No se pudo generar URL de descarga');
    }
  }

  async deleteAttachment(id: string): Promise<void> {
    const attachment = await this.getAttachment(id);

    // delete from minio
    try {
      await this.minioClient.removeObject(this.bucket, attachment.filePath);
    } catch (err) {
      // log and continue to remove metadata; depending on policy you may want to fail
      // eslint-disable-next-line no-console
      console.error('Error eliminando objeto en MinIO:', err);
    }

    await this.attachmentRepository.remove(attachment);
  }

  private async putObjectFromBuffer(objectName: string, buffer: Buffer, contentType: string): Promise<void> {
    // putObject supports buffer directly and returns a promise
    await this.minioClient.putObject(this.bucket, objectName, buffer, buffer.length, { 'Content-Type': contentType } as any);
  }

  private async putObjectFromPath(objectName: string, path: string, contentType: string): Promise<void> {
    // stream upload — size can be omitted
    await fsPromises.access(path);
    const stream = createReadStream(path);
    await this.minioClient.putObject(this.bucket, objectName, stream, undefined, { 'Content-Type': contentType } as any);
  }
}