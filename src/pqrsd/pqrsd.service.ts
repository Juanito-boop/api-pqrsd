import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, LessThan, Not } from 'typeorm';
import { PqrsdRequest } from '../entities/pqrsd-request.entity';
import { PqrsdComment } from '../entities/pqrsd-comment.entity';
import { PqrsdAttachment } from '../entities/pqrsd-attachment.entity';
import { PqrsdStatusHistory } from '../entities/pqrsd-status-history.entity';
import { CreatePqrsdDto } from './dto/create-pqrsd.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AssignPqrsdDto } from './dto/assign-pqrsd.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PqrsdQueryDto } from './dto/pqrsd-query.dto';
import { PqrsdType } from '../common/enums/pqrsd-type.enum';
import { PqrsdStatus } from '../common/enums/pqrsd-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { FilesService } from '../files/files.service';

@Injectable()
export class PqrsdService {
  constructor(
    @InjectRepository(PqrsdRequest)
    private pqrsdRepository: Repository<PqrsdRequest>,
    @InjectRepository(PqrsdComment)
    private commentRepository: Repository<PqrsdComment>,
    @InjectRepository(PqrsdAttachment)
    private attachmentRepository: Repository<PqrsdAttachment>,
    @InjectRepository(PqrsdStatusHistory)
    private statusHistoryRepository: Repository<PqrsdStatusHistory>,
    private notificationsService: NotificationsService,
    private filesService: FilesService,
  ) {}

  async create(createPqrsdDto: CreatePqrsdDto): Promise<PqrsdRequest> {
    const filingNumber = await this.generateFilingNumber();
    const dueDate = this.calculateDueDate(createPqrsdDto.type);

    const accessCode = this.generateAccessCode();

    const pqrsd = this.pqrsdRepository.create({
      ...createPqrsdDto,
      filingNumber,
      dueDate,
      status: PqrsdStatus.RECIBIDA,
      petitionerAccessCode: accessCode,
    });

    const savedPqrsd = await this.pqrsdRepository.save(pqrsd);

    // Create initial status history
    await this.statusHistoryRepository.save({
      pqrsdId: savedPqrsd.id,
      previousStatus: null,
      newStatus: PqrsdStatus.RECIBIDA,
      changeReason: 'PQRSD creada',
      changedById: null,
    });

    // Send email to petitioner with filing number and access code
    try {
      await this.notificationsService.sendPqrsdCreatedEmail(
        savedPqrsd.petitionerEmail,
        savedPqrsd.filingNumber,
        savedPqrsd.petitionerAccessCode,
      );
    } catch (err) {
      // Log but don't fail creation
      // eslint-disable-next-line no-console
      console.warn('Failed to send creation email:', err?.message || err);
    }

    return savedPqrsd;
  }

  private generateAccessCode(length = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async findAll(query: PqrsdQueryDto): Promise<{ data: PqrsdRequest[]; total: number; vencidas: number }> {
    const { page, limit, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assignedDepartmentId) where.assignedDepartmentId = filters.assignedDepartmentId;
    if (filters.assignedUserId) where.assignedUserId = filters.assignedUserId;

    const findOptions: FindManyOptions<PqrsdRequest> = {
      where,
      relations: ['assignedDepartment', 'assignedUser'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    };

    if (filters.createdFrom || filters.createdTo) {
      findOptions.where = {
        ...where,
        ...(filters.createdFrom && { createdAt: Like(`${filters.createdFrom}%`) }),
      };
    }

    const [data, total] = await this.pqrsdRepository.findAndCount(findOptions);

    // Compute total overdue (vencidas).
    // We'll respect the same filters except the `status` filter so the overdue count
    // represents how many matching requests are past due and not closed.
    const now = new Date();
    const overdueWhere: any = { ...where };
    if (overdueWhere.status) delete overdueWhere.status;

    const vencidas = await this.pqrsdRepository.count({
      where: {
        ...overdueWhere,
        dueDate: LessThan(now),
        status: Not(PqrsdStatus.CERRADA),
      },
    });

    return { data, total, vencidas };
  }

  async findOne(id: string): Promise<PqrsdRequest> {
    const pqrsd = await this.pqrsdRepository.findOne({
      where: { id },
      relations: [
        'assignedDepartment',
        'assignedUser',
        'comments',
        'comments.user',
        'attachments',
        'statusHistory',
        'statusHistory.changedBy',
      ],
    });

    if (!pqrsd) {
      throw new NotFoundException('PQRSD no encontrada');
    }

    return pqrsd;
  }

  async findByFilingNumber(filingNumber: string): Promise<PqrsdRequest> {
    const pqrsd = await this.pqrsdRepository.findOne({
      where: { filingNumber },
      relations: ['assignedDepartment', 'comments', 'attachments'],
    });

    if (!pqrsd) {
      throw new NotFoundException('PQRSD no encontrada con el número de radicado proporcionado');
    }

    return pqrsd;
  }

  async findByFilingNumberAndAccessCode(filingNumber: string, accessCode: string): Promise<PqrsdRequest> {
    const pqrsd = await this.pqrsdRepository.findOne({
      where: { filingNumber, petitionerAccessCode: accessCode },
      relations: ['assignedDepartment', 'comments', 'attachments', 'statusHistory'],
    });

    if (!pqrsd) {
      throw new NotFoundException('PQRSD no encontrada con el número de radicado o código de acceso proporcionado');
    }

    return pqrsd;
  }

  async updateStatus(id: string, updateStatusDto: UpdateStatusDto, userId: string): Promise<PqrsdRequest> {
    const pqrsd = await this.findOne(id);
    const previousStatus = pqrsd.status;

    // Validate status transition
    this.validateStatusTransition(previousStatus, updateStatusDto.status);

    pqrsd.status = updateStatusDto.status;
    if (updateStatusDto.status === PqrsdStatus.RESPONDIDA) {
      pqrsd.responseDate = new Date();
    }

    const updatedPqrsd = await this.pqrsdRepository.save(pqrsd);

    // Record status history
    await this.statusHistoryRepository.save({
      pqrsdId: id,
      previousStatus,
      newStatus: updateStatusDto.status,
      changeReason: updateStatusDto.reason,
      changedById: userId,
    });

    return updatedPqrsd;
  }

  async assign(id: string, assignDto: AssignPqrsdDto): Promise<PqrsdRequest> {
    const pqrsd = await this.findOne(id);

    if (assignDto.departmentId) {
      pqrsd.assignedDepartmentId = assignDto.departmentId;
    }

    if (assignDto.userId) {
      pqrsd.assignedUserId = assignDto.userId;
      pqrsd.status = PqrsdStatus.ASIGNADA;
    }

    return this.pqrsdRepository.save(pqrsd);
  }

  async addComment(id: string, createCommentDto: CreateCommentDto, userId: string): Promise<PqrsdComment> {
    const pqrsd = await this.findOne(id);

    const comment = this.commentRepository.create({
      pqrsdId: id,
      userId,
      ...createCommentDto,
    });

    return this.commentRepository.save(comment);
  }

  async getComments(id: string, includeInternal = true): Promise<PqrsdComment[]> {
    const where: any = { pqrsdId: id };
    
    if (!includeInternal) {
      where.isInternal = false;
    }

    return this.commentRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  private async generateFilingNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.pqrsdRepository.count({
      where: { filingNumber: Like(`PQRSD-${year}-%`) },
    });
    const sequence = (count + 1).toString().padStart(6, '0');
    return `PQRSD-${year}-${sequence}`;
  }

  private calculateDueDate(type: PqrsdType): Date {
    const now = new Date();
    let workingDays = 15; // Default

    switch (type) {
      case PqrsdType.PETICION:
      case PqrsdType.QUEJA:
      case PqrsdType.RECLAMO:
        workingDays = 15;
        break;
      case PqrsdType.SUGERENCIA:
      case PqrsdType.DENUNCIA:
        workingDays = 30;
        break;
    }

    // Calculate working days (excluding weekends)
    let businessDays = 0;
    const dueDate = new Date(now);

    while (businessDays < workingDays) {
      dueDate.setDate(dueDate.getDate() + 1);
      const dayOfWeek = dueDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++;
      }
    }

    return dueDate;
  }

  async remove(id: string): Promise<void> {
    const pqrsd = await this.pqrsdRepository.findOne({ where: { id } });
    if (!pqrsd) {
      throw new NotFoundException('PQRSD no encontrada');
    }

    // Eliminar archivos adjuntos de MinIO y BD
    const attachments = await this.attachmentRepository.find({ where: { pqrsdId: id } });
    for (const attachment of attachments) {
      try {
        await this.filesService.deleteAttachment(attachment.id);
      } catch (error) {
        // Log error but continue
        console.error(`Error eliminando archivo ${attachment.id}:`, error);
      }
    }

    // Eliminar comentarios
    await this.commentRepository.delete({ pqrsdId: id });

    // Eliminar historial de estados
    await this.statusHistoryRepository.delete({ pqrsdId: id });

    // Eliminar la PQRSD
    await this.pqrsdRepository.remove(pqrsd);
  }

  private validateStatusTransition(currentStatus: PqrsdStatus, newStatus: PqrsdStatus): void {
    const validTransitions = {
      [PqrsdStatus.RECIBIDA]: [PqrsdStatus.EN_PROCESO, PqrsdStatus.ASIGNADA],
      [PqrsdStatus.EN_PROCESO]: [PqrsdStatus.ASIGNADA, PqrsdStatus.RESPONDIDA],
      [PqrsdStatus.ASIGNADA]: [PqrsdStatus.EN_PROCESO, PqrsdStatus.RESPONDIDA],
      [PqrsdStatus.RESPONDIDA]: [PqrsdStatus.CERRADA],
      [PqrsdStatus.CERRADA]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `No es posible cambiar de estado ${currentStatus} a ${newStatus}`
      );
    }
  }
}