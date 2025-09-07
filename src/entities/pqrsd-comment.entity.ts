import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { PqrsdRequest } from './pqrsd-request.entity';
import { User } from './user.entity';

@Entity('pqrsd_comments')
export class PqrsdComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'pqrsd_id' })
  pqrsdId: string;

  @ManyToOne(() => PqrsdRequest, (request) => request.comments)
  @JoinColumn({ name: 'pqrsd_id' })
  pqrsd: PqrsdRequest;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  comment: string;

  @Column({ name: 'is_internal', default: false })
  isInternal: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}