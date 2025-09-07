import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Res,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { FilesService } from './files.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Archivos')
@Controller('files')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload/:pqrsdId')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir archivos adjuntos a una PQRSD' })
  @ApiResponse({
    status: 201,
    description: 'Archivos subidos exitosamente',
  })
  async uploadFiles(
    @Param('pqrsdId') pqrsdId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.filesService.uploadFiles(pqrsdId, files);
  }

  @Get('pqrsd/:pqrsdId')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.ANALYST)
  @ApiOperation({ summary: 'Listar archivos de una PQRSD' })
  @ApiResponse({
    status: 200,
    description: 'Lista de archivos adjuntos',
  })
  getAttachmentsByPqrsd(@Param('pqrsdId') pqrsdId: string) {
    return this.filesService.getAttachmentsByPqrsd(pqrsdId);
  }

  @Get('download/:id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.ANALYST)
  @ApiOperation({ summary: 'Descargar archivo adjunto' })
  @ApiResponse({
    status: 200,
    description: 'Archivo descargado',
  })
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const attachment = await this.filesService.getAttachment(id);
    
    res.set({
      'Content-Type': attachment.mimeType,
      'Content-Disposition': `attachment; filename="${attachment.originalName}"`,
      'Content-Length': attachment.fileSize,
    });

    const fileStream = createReadStream(attachment.filePath);
    fileStream.pipe(res);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Eliminar archivo adjunto' })
  @ApiResponse({
    status: 200,
    description: 'Archivo eliminado exitosamente',
  })
  deleteAttachment(@Param('id') id: string) {
    return this.filesService.deleteAttachment(id);
  }
}