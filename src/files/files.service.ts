import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PqrsdAttachment } from '../entities/pqrsd-attachment.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(PqrsdAttachment)
    private attachmentRepository: Repository<PqrsdAttachment>,
  ) {}

  async uploadFiles(pqrsdId: string, files: Express.Multer.File[]): Promise<PqrsdAttachment[]> {
    const attachments = files.map(file => 
      this.attachmentRepository.create({
        pqrsdId,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
      })
    );

    return this.attachmentRepository.save(attachments);
  }

  async getAttachmentsByPqrsd(pqrsdId: string): Promise<PqrsdAttachment[]> {
    return this.attachmentRepository.find({
      where: { pqrsdId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAttachment(id: string): Promise<PqrsdAttachment> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('Archivo no encontrado');
    }

    return attachment;
  }

  async deleteAttachment(id: string): Promise<void> {
    const attachment = await this.getAttachment(id);
    await this.attachmentRepository.remove(attachment);
    
    // En una implementación real, también eliminarías el archivo físico
    // fs.unlinkSync(attachment.filePath);
  }
}