import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PqrsdType } from '../common/enums/pqrsd-type.enum';
import { PqrsdStatus } from '../common/enums/pqrsd-status.enum';
import { Priority } from '../common/enums/priority.enum';
import { PetitionerType } from '../common/enums/petitioner-type.enum';
import { IdType } from '../common/enums/id-type.enum';
import { Department } from './department.entity';
import { User } from './user.entity';
import { PqrsdComment } from './pqrsd-comment.entity';
import { PqrsdAttachment } from './pqrsd-attachment.entity';
import { PqrsdStatusHistory } from './pqrsd-status-history.entity';

@Entity('pqrsd_requests')
export class PqrsdRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'filing_number', unique: true })
  filingNumber: string;

  @Column({
    type: 'enum',
    enum: PqrsdType,
  })
  type: PqrsdType;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    name: 'petitioner_type',
    type: 'enum',
    enum: PetitionerType,
  })
  petitionerType: PetitionerType;

  @Column({ name: 'petitioner_name' })
  petitionerName: string;

  @Column({ name: 'petitioner_email' })
  petitionerEmail: string;

  @Column({ name: 'petitioner_access_code', nullable: true })
  petitionerAccessCode: string;

  @Column({ name: 'petitioner_phone' })
  petitionerPhone: string;

  @Column({ name: 'petitioner_address', type: 'text' })
  petitionerAddress: string;

  @Column({
    name: 'petitioner_id_type',
    type: 'enum',
    enum: IdType,
  })
  petitionerIdType: IdType;

  @Column({ name: 'petitioner_id_number' })
  petitionerIdNumber: string;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIA,
  })
  priority: Priority;

  @Column({
    type: 'enum',
    enum: PqrsdStatus,
    default: PqrsdStatus.RECIBIDA,
  })
  status: PqrsdStatus;

  @Column({ name: 'assigned_department_id', nullable: true })
  assignedDepartmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'assigned_department_id' })
  assignedDepartment: Department;

  @Column({ name: 'assigned_user_id', nullable: true })
  assignedUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_user_id' })
  assignedUser: User;

  @Column({ name: 'due_date' })
  dueDate: Date;

  @Column({ name: 'response_date', nullable: true })
  responseDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PqrsdComment, (comment) => comment.pqrsd)
  comments: PqrsdComment[];

  @OneToMany(() => PqrsdAttachment, (attachment) => attachment.pqrsd)
  attachments: PqrsdAttachment[];

  @OneToMany(() => PqrsdStatusHistory, (history) => history.pqrsd)
  statusHistory: PqrsdStatusHistory[];
}