import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { PqrsdService } from './pqrsd.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PqrsdAttachment } from '../entities/pqrsd-attachment.entity';
import { CreatePqrsdDto } from './dto/create-pqrsd.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AssignPqrsdDto } from './dto/assign-pqrsd.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PqrsdQueryDto } from './dto/pqrsd-query.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('PQRSD')
@ApiConsumes('multipart/form-data')
@Controller('pqrsd')
export class PqrsdController {
  constructor(
    private readonly pqrsdService: PqrsdService,
    @InjectRepository(PqrsdAttachment)
    private readonly attachmentRepository: Repository<PqrsdAttachment>,
  ) {}

  @Public()
  @Post('submit')
  @ApiOperation({ summary: 'Crear nueva PQRSD (público)' })
  @ApiResponse({ status: 201, description: 'PQRSD creada exitosamente', })
  async submit(@Body() createPqrsdDto: CreatePqrsdDto) {
    return this.pqrsdService.create(createPqrsdDto);
  }

  @Public()
  @Get('track/:filingNumber')
  @ApiOperation({ summary: 'Consultar estado de PQRSD por número de radicado (público)' })
  @ApiResponse({ status: 200, description: 'Estado de la PQRSD', })
  @ApiResponse({ status: 404, description: 'PQRSD no encontrada', })
    async track(
      @Param('filingNumber') filingNumber: string,
      @Query('accessCode') accessCode?: string,
    ) {
      let pqrsd;
      if (accessCode) {
        pqrsd = await this.pqrsdService.findByFilingNumberAndAccessCode(filingNumber, accessCode);
      } else {
        pqrsd = await this.pqrsdService.findByFilingNumber(filingNumber);
      }
      const publicComments = await this.pqrsdService.getComments(pqrsd.id, false);
      return {
        ...pqrsd,
        comments: publicComments,
      };
    }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.ANALYST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas las PQRSD con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de PQRSD' })
  async findAll(@Query() query: PqrsdQueryDto) {
    return this.pqrsdService.findAll(query);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.ANALYST)
  @ApiOperation({ summary: 'Obtener PQRSD específica' })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la PQRSD',
  })
  @ApiResponse({
    status: 404,
    description: 'PQRSD no encontrada',
  })
  async findOne(@Param('id') id: string) {
    return this.pqrsdService.findOne(id);
  }

  @Put(':id/assign')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Asignar PQRSD a departamento/usuario' })
  @ApiResponse({
    status: 200,
    description: 'PQRSD asignada exitosamente',
  })
  async assign(@Param('id') id: string, @Body() assignDto: AssignPqrsdDto) {
    return this.pqrsdService.assign(id, assignDto);
  }

  @Put(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Cambiar estado de la PQRSD' })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req,
  ) {
    return this.pqrsdService.updateStatus(id, updateStatusDto, req.user.id);
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Agregar comentario a la PQRSD' })
  @ApiResponse({
    status: 201,
    description: 'Comentario agregado exitosamente',
  })
  async addComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    return this.pqrsdService.addComment(id, createCommentDto, req.user.id);
  }

  @Get(':id/comments')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.ANALYST)
  @ApiOperation({ summary: 'Obtener comentarios de la PQRSD' })
  @ApiResponse({
    status: 200,
    description: 'Lista de comentarios',
  })
  async getComments(@Param('id') id: string) {
    return this.pqrsdService.getComments(id, true);
  }

  @Post(':id/attachments')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir archivos adjuntos' })
  @ApiResponse({
    status: 201,
    description: 'Archivos subidos exitosamente',
  })
  async uploadAttachments(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Implementation for file upload will be in the file upload service
    return { message: 'Files uploaded successfully' };
  }

  @Get(':id/attachments')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.ANALYST)
  @ApiOperation({ summary: 'Listar archivos adjuntos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de archivos',
  })
  async getAttachments(@Param('id') id: string) {
    return this.attachmentRepository.find({
      where: { pqrsdId: id },
      order: { createdAt: 'DESC' },
    });
  }
}