import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Departamentos')
@Controller('departments')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear nuevo departamento' })
  @ApiResponse({
    status: 201,
    description: 'Departamento creado exitosamente',
  })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.ANALYST)
  @ApiOperation({ summary: 'Listar todos los departamentos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de departamentos',
  })
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.ANALYST)
  @ApiOperation({ summary: 'Obtener departamento específico' })
  @ApiResponse({
    status: 200,
    description: 'Detalles del departamento',
  })
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar departamento' })
  @ApiResponse({
    status: 200,
    description: 'Departamento actualizado exitosamente',
  })
  update(@Param('id') id: string, @Body() updateDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar departamento' })
  @ApiResponse({
    status: 200,
    description: 'Departamento eliminado exitosamente',
  })
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}