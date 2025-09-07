# Sistema PQRSD API

API REST completa desarrollada en NestJS para la gestión de PQRSD (Peticiones, Quejas, Reclamos, Sugerencias y Denuncias) para organizaciones colombianas.

## 🚀 Características Principales

- **Autenticación JWT** con roles y permisos
- **Gestión completa de PQRSD** con seguimiento de estados
- **Sistema de departamentos** y asignación de casos
- **Analytics y reportes** detallados
- **Subida de archivos adjuntos**
- **Tracking público** por número de radicado
- **Rate limiting** para seguridad
- **Documentación Swagger** automática

## 📋 Prerrequisitos

- Node.js 18+
- PostgreSQL 12+
- npm o yarn

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd pqrsd-api
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

4. Configura tu base de datos PostgreSQL en el archivo `.env`

5. Ejecuta las migraciones:
```bash
npm run migration:run
```

6. Inicia la aplicación:
```bash
npm run start:dev
```

## 🏗️ Arquitectura

### Módulos Principales

- **AuthModule**: Autenticación y autorización
- **PqrsdModule**: Gestión principal de PQRSD
- **UsersModule**: Administración de usuarios
- **DepartmentsModule**: Gestión de departamentos
- **AnalyticsModule**: Métricas y estadísticas
- **ReportsModule**: Generación de reportes
- **FilesModule**: Gestión de archivos adjuntos
- **NotificationsModule**: Sistema de notificaciones

### Base de Datos

El sistema utiliza PostgreSQL con TypeORM como ORM. El esquema incluye:

- **users**: Usuarios del sistema con roles
- **departments**: Departamentos organizacionales
- **pqrsd_requests**: Solicitudes principales
- **pqrsd_comments**: Sistema de comentarios
- **pqrsd_attachments**: Archivos adjuntos
- **pqrsd_status_history**: Auditoría de cambios

## 🔐 Seguridad

- **JWT Authentication** para todos los endpoints protegidos
- **Role-based Access Control** (RBAC)
- **Row Level Security** (RLS) en PostgreSQL
- **Rate limiting** en endpoints públicos
- **Helmet** para headers de seguridad
- **CORS** configurado correctamente

## 📚 Documentación API

Una vez que la aplicación esté ejecutándose, puedes acceder a la documentación interactiva en:

```
http://localhost:3000/api/docs
```

## 🧪 Testing

Ejecutar tests:
```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## 📊 Endpoints Principales

### Públicos (sin autenticación)
- `POST /api/v1/pqrsd/submit` - Crear nueva PQRSD
- `GET /api/v1/pqrsd/track/:filing_number` - Consultar estado

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `GET /api/v1/auth/me` - Usuario actual
- `POST /api/v1/auth/refresh` - Renovar token

### PQRSD (Requiere autenticación)
- `GET /api/v1/pqrsd` - Listar con filtros
- `GET /api/v1/pqrsd/:id` - Detalles específicos
- `PUT /api/v1/pqrsd/:id/assign` - Asignar caso
- `PUT /api/v1/pqrsd/:id/status` - Cambiar estado

### Analytics y Reportes
- `GET /api/v1/analytics/dashboard` - Métricas principales
- `GET /api/v1/analytics/monthly` - Estadísticas mensuales
- `POST /api/v1/reports/generate` - Generar reporte

## 🌟 Características del Sistema

### Generación de Números de Radicado
- Formato automático: `PQRSD-YYYY-NNNNNN`
- Secuencial por año

### Cálculo de Fechas Límite
- Petición/Queja/Reclamo: 15 días hábiles
- Sugerencia/Denuncia: 30 días hábiles

### Roles del Sistema
- **Admin**: Acceso completo al sistema
- **Operator**: Gestión de casos asignados
- **Analyst**: Solo lectura y reportes

### Estados de PQRSD
- **Recibida**: Estado inicial
- **En Proceso**: En revisión
- **Asignada**: Asignada a responsable
- **Respondida**: Respuesta enviada
- **Cerrada**: Caso finalizado

## 🔧 Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `DATABASE_URL` | Conexión a PostgreSQL | - |
| `JWT_SECRET` | Clave secreta para JWT | - |
| `JWT_EXPIRES_IN` | Expiración del token | 24h |
| `PORT` | Puerto del servidor | 3000 |
| `UPLOAD_PATH` | Directorio de archivos | ./uploads |
| `MAX_FILE_SIZE` | Tamaño máximo de archivo | 10MB |

## 📈 Monitoreo

El sistema incluye:
- **Logging estructurado** con Winston
- **Métricas de rendimiento**
- **Alertas automáticas** por vencimientos
- **Interceptors** para auditoría

## 🚀 Despliegue

Para producción:

1. Configura las variables de entorno de producción
2. Ejecuta el build:
```bash
npm run build
```

3. Inicia la aplicación:
```bash
npm run start:prod
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.