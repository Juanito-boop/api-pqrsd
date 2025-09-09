# Especificación de Requisitos de Software (SRS)
## Sistema de Gestión de PQRSD

**Documento conforme a IEEE 830-1998**  
**Versión:** 1.0  
**Fecha:** Septiembre 2025  
**Autor:** Equipo de Desarrollo  

---

## 1. Introducción

### 1.1 Propósito
Este documento describe los requisitos funcionales y no funcionales del Sistema de Gestión de PQRSD (Peticiones, Quejas, Reclamos, Sugerencias y Denuncias) para organizaciones colombianas. El sistema proporciona una plataforma integral para la recepción, gestión, seguimiento y resolución de PQRSD de manera eficiente y transparente.

### 1.2 Alcance
El sistema abarca:
- **Recepción pública de PQRSD** a través de API REST
- **Gestión administrativa** completa del ciclo de vida
- **Sistema de autenticación y autorización** basado en roles
- **Asignación automática y manual** por departamentos
- **Seguimiento público** con códigos de acceso seguros
- **Generación de reportes y analytics** detallados
- **Sistema de notificaciones** automáticas
- **Gestión de archivos adjuntos** con MinIO

### 1.3 Definiciones, Acrónimos y Abreviaturas
- **PQRSD**: Peticiones, Quejas, Reclamos, Sugerencias, Denuncias
- **API**: Application Programming Interface
- **JWT**: JSON Web Token
- **RBAC**: Role-Based Access Control
- **SLA**: Service Level Agreement
- **DTO**: Data Transfer Object

### 1.4 Referencias
- [ISO 25010] - Calidad del producto de software
- [ISO 29148] - Ingeniería de requisitos
- [IEEE 830] - Especificación de requisitos de software
- [ISO 12207] - Procesos del ciclo de vida del software

---

## 2. Descripción General

### 2.1 Perspectiva del Producto
El Sistema PQRSD es una aplicación web que permite a las organizaciones colombianas gestionar eficientemente sus procesos de atención al ciudadano. El sistema se integra con bases de datos PostgreSQL y servicios de almacenamiento MinIO para archivos.

### 2.2 Funciones del Producto
- **Recepción de PQRSD**: Interfaz pública para ciudadanos
- **Gestión de usuarios**: Administración de funcionarios
- **Asignación de casos**: Distribución automática por departamentos
- **Seguimiento de estados**: Control del ciclo de vida completo
- **Sistema de comentarios**: Comunicación interna y externa
- **Generación de reportes**: Analytics y estadísticas
- **Gestión documental**: Archivos adjuntos seguros

### 2.3 Características del Usuario
- **Ciudadano**: Puede crear y consultar PQRSD públicas
- **Operador**: Gestiona casos asignados, actualiza estados
- **Analista**: Consulta reportes y estadísticas
- **Administrador**: Configuración completa del sistema

### 2.4 Restricciones
- **Tecnológicas**: Node.js 18+, PostgreSQL 12+, Docker
- **Legales**: Cumplimiento con normatividad colombiana
- **De rendimiento**: Respuesta < 2s para operaciones críticas
- **De seguridad**: Encriptación de datos sensibles

### 2.5 Suposiciones y Dependencias
- Disponibilidad de infraestructura de red
- Acceso a servicios de correo electrónico
- Compatibilidad con navegadores modernos
- Cumplimiento con estándares de accesibilidad

---

## 3. Requisitos Específicos

### 3.1 Requisitos Funcionales Externos

#### 3.1.1 Gestión de PQRSD
**SRS-FUN-001**: El sistema debe permitir la creación de nuevas PQRSD a través de API REST  
**Prioridad**: Alta  
**Descripción**: Los ciudadanos pueden crear PQRSD especificando tipo, asunto, descripción y datos personales.

**SRS-FUN-002**: El sistema debe generar automáticamente números de radicado únicos  
**Prioridad**: Alta  
**Descripción**: Formato: PQRSD-YYYY-NNNNNN, único por año.

**SRS-FUN-003**: El sistema debe calcular automáticamente fechas límite  
**Prioridad**: Alta  
**Descripción**: 15 días hábiles para peticiones/quejas/reclamos, 30 días para sugerencias/denuncias.

#### 3.1.2 Autenticación y Autorización
**SRS-FUN-004**: El sistema debe implementar autenticación JWT  
**Prioridad**: Crítica  
**Descripción**: Login seguro con email y contraseña, tokens con expiración.

**SRS-FUN-005**: El sistema debe implementar control de acceso basado en roles  
**Prioridad**: Crítica  
**Descripción**: Roles: Admin, Operator, Analyst con permisos diferenciados.

#### 3.1.3 Gestión de Estados
**SRS-FUN-006**: El sistema debe gestionar transiciones de estado válidas  
**Prioridad**: Alta  
**Descripción**: Estados: Recibida → En Proceso → Asignada → Respondida → Cerrada.

**SRS-FUN-007**: El sistema debe registrar historial de cambios de estado  
**Prioridad**: Media  
**Descripción**: Auditoría completa con usuario, fecha y razón del cambio.

#### 3.1.4 Sistema de Comentarios
**SRS-FUN-008**: El sistema debe permitir comentarios internos y públicos  
**Prioridad**: Media  
**Descripción**: Comentarios internos solo visibles para funcionarios.

**SRS-FUN-009**: El sistema debe notificar cambios relevantes  
**Prioridad**: Media  
**Descripción**: Notificaciones por email para eventos importantes.

### 3.2 Requisitos de Rendimiento

#### 3.2.1 Tiempo de Respuesta
**SRS-PERF-001**: Operaciones críticas < 500ms  
**Prioridad**: Alta  
**Descripción**: Login, creación de PQRSD, consultas básicas.

**SRS-PERF-002**: Operaciones complejas < 2s  
**Prioridad**: Media  
**Descripción**: Generación de reportes, búsquedas avanzadas.

#### 3.2.2 Capacidad
**SRS-PERF-003**: Soporte concurrente de 1000 usuarios  
**Prioridad**: Media  
**Descripción**: Capacidad para picos de carga.

**SRS-PERF-004**: Almacenamiento de 10GB de archivos  
**Prioridad**: Media  
**Descripción**: Capacidad inicial de almacenamiento.

### 3.3 Requisitos Lógicos de Base de Datos

#### 3.3.1 Integridad Referencial
**SRS-DB-001**: El sistema debe mantener integridad referencial  
**Prioridad**: Crítica  
**Descripción**: Foreign keys y constraints apropiadas.

#### 3.3.2 Normalización
**SRS-DB-002**: Base de datos en tercera forma normal  
**Prioridad**: Alta  
**Descripción**: Optimización de consultas y mantenimiento.

### 3.4 Requisitos de Interfaz de Usuario

#### 3.4.1 API REST
**SRS-UI-001**: Endpoints RESTful consistentes  
**Prioridad**: Alta  
**Descripción**: Convenciones REST, códigos HTTP apropiados.

**SRS-UI-002**: Documentación Swagger completa  
**Prioridad**: Media  
**Descripción**: API documentada automáticamente.

### 3.5 Requisitos de Software del Sistema

#### 3.5.1 Dependencias
**SRS-SYS-001**: Node.js 18+ como runtime  
**Prioridad**: Crítica  
**Descripción**: Entorno de ejecución principal.

**SRS-SYS-002**: PostgreSQL 12+ como base de datos  
**Prioridad**: Crítica  
**Descripción**: Almacenamiento persistente.

**SRS-SYS-003**: MinIO para almacenamiento de archivos  
**Prioridad**: Alta  
**Descripción**: Gestión de archivos adjuntos.

---

## 4. Apéndices

### 4.1 Glosario de Términos
- **Petición**: Solicitud de información o documentos
- **Queja**: Expresión de insatisfacción por servicios
- **Reclamo**: Solicitud de reparación por daños
- **Sugerencia**: Propuesta de mejora
- **Denuncia**: Comunicación de irregularidades

### 4.2 Casos de Uso Principales
1. **Creación de PQRSD**: Ciudadano → Sistema
2. **Asignación de caso**: Administrador → Operador
3. **Actualización de estado**: Operador → Sistema
4. **Consulta de estado**: Ciudadano → Sistema
5. **Generación de reportes**: Analista → Sistema

### 4.3 Métricas de Aceptación
- **Cobertura de pruebas**: > 80%
- **Tiempo de respuesta**: < 2s promedio
- **Disponibilidad**: > 99.5%
- **Tasa de errores**: < 0.1%

---

**Fin del Documento**  
**Aprobado por:** [Nombre del Responsable]  
**Fecha de aprobación:** [Fecha]</content>
<parameter name="filePath">c:\Users\USUARIO\Desktop\PQRSD\API\docs\srs-ieee830.md
