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

@Entity('pqrsd_status_history')
export class PqrsdStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'pqrsd_id' })
  pqrsdId: string;

  @ManyToOne(() => PqrsdRequest, (request) => request.statusHistory)
  @JoinColumn({ name: 'pqrsd_id' })
  pqrsd: PqrsdRequest;

  @Column({ name: 'previous_status', nullable: true })
  previousStatus: string;

  @Column({ name: 'new_status' })
  newStatus: string;

  @Column({ name: 'changed_by', nullable: true })
  changedById: string;

  @ManyToOne(() => User, (user) => user.statusChanges)
  @JoinColumn({ name: 'changed_by' })
  changedBy: User;

  @Column({ name: 'change_reason', type: 'text', nullable: true })
  changeReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}