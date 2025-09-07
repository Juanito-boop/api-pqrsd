import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { PqrsdRequest } from './pqrsd-request.entity';

@Entity('pqrsd_attachments')
export class PqrsdAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'pqrsd_id' })
  pqrsdId: string;

  @ManyToOne(() => PqrsdRequest, (request) => request.attachments)
  @JoinColumn({ name: 'pqrsd_id' })
  pqrsd: PqrsdRequest;

  @Column()
  filename: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}