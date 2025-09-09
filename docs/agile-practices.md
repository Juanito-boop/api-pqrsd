# Prácticas Ágiles Implementadas
## Metodología Scrum para Sistema PQRSD

**Versión:** 1.0  
**Fecha:** Septiembre 2025  
**Equipo:** Desarrollo PQRSD  

---

## 1. Visión General

Este documento describe la implementación de prácticas ágiles en el desarrollo del Sistema PQRSD, siguiendo los principios del Manifiesto Ágil y la metodología Scrum.

### 1.1 Principios Ágiles Adoptados
- **Individuos e interacciones** sobre procesos y herramientas
- **Software funcionando** sobre documentación comprehensiva
- **Colaboración con el cliente** sobre negociación contractual
- **Respuesta ante el cambio** sobre seguir un plan

---

## 2. Marco de Trabajo Scrum

### 2.1 Roles Definidos

#### 2.1.1 Product Owner
**Responsabilidades:**
- Definir y priorizar el Product Backlog
- Asegurar el valor del producto
- Aceptar o rechazar el trabajo completado
- Comunicar la visión del producto

**Actividades:**
- Refinamiento del backlog semanal
- Participación en Sprint Reviews
- Comunicación con stakeholders
- Toma de decisiones sobre alcance

#### 2.1.2 Scrum Master
**Responsabilidades:**
- Facilitar el proceso Scrum
- Remover impedimentos
- Proteger al equipo de distracciones
- Asegurar la mejora continua

**Actividades:**
- Facilitación de ceremonias
- Coaching del equipo
- Gestión de impedimentos
- Mejora de procesos

#### 2.1.3 Equipo de Desarrollo
**Composición:**
- 5-7 miembros multidisciplinarios
- Desarrolladores backend (Node.js/NestJS)
- Desarrolladores frontend (React/TypeScript)
- QA Engineers
- DevOps Engineer

**Responsabilidades:**
- Entregar incrementos potencialmente utilizables
- Auto-organización y autogestión
- Participación activa en todas las ceremonias

### 2.2 Eventos de Scrum

#### 2.2.1 Sprint Planning (4 horas)
**Objetivos:**
- Definir el objetivo del Sprint
- Seleccionar items del Product Backlog
- Crear el Sprint Backlog

**Actividades:**
- Estimación de esfuerzo (Story Points)
- Desglose de historias de usuario
- Identificación de dependencias
- Compromiso del equipo

#### 2.2.2 Daily Standup (15 minutos)
**Formato:**
- ¿Qué hice ayer?
- ¿Qué haré hoy?
- ¿Hay impedimentos?

**Beneficios:**
- Transparencia diaria
- Detección temprana de problemas
- Coordinación del equipo
- Mejora de comunicación

#### 2.2.3 Sprint Review (2 horas)
**Objetivos:**
- Demostrar el trabajo completado
- Recopilar feedback
- Discutir próximos pasos

**Participantes:**
- Equipo de desarrollo
- Product Owner
- Stakeholders clave
- Usuarios finales (cuando aplica)

#### 2.2.4 Sprint Retrospective (1.5 horas)
**Estructura:**
- ¿Qué funcionó bien?
- ¿Qué puede mejorar?
- ¿Qué acciones concretas tomaremos?

**Técnicas utilizadas:**
- Start, Stop, Continue
- Sailboat retrospective
- Timeline retrospective

### 2.3 Artefactos de Scrum

#### 2.3.1 Product Backlog
**Características:**
- Lista viva de todos los requisitos
- Priorizada por valor de negocio
- Estimada en Story Points
- Refinada continuamente

**Categorías de historias:**
- **Épicas**: Grandes funcionalidades (PQRSD Management)
- **Historias**: Requisitos específicos
- **Tareas técnicas**: Deuda técnica, refactorización
- **Bugs**: Defectos encontrados

#### 2.3.2 Sprint Backlog
**Contenido:**
- Items seleccionados para el Sprint
- Tareas de implementación
- Criterios de aceptación
- Definición de Done

#### 2.3.3 Incremento
**Definición:**
- Software potencialmente utilizable
- Cumple con Definition of Done
- Aceptado por Product Owner
- Listo para producción

---

## 3. Prácticas de Desarrollo Ágil

### 3.1 Desarrollo Guiado por Pruebas (TDD/BDD)

#### 3.1.1 Test-Driven Development
```typescript
// Ejemplo: Desarrollo de funcionalidad de creación de PQRSD
describe('PqrsdService', () => {
  describe('create', () => {
    it('should create a new PQRSD with valid data', async () => {
      // Arrange
      const createPqrsdDto = { /* valid data */ };

      // Act
      const result = await service.create(createPqrsdDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.filingNumber).toMatch(/^PQRSD-\d{4}-\d{6}$/);
    });
  });
});
```

#### 3.1.2 Behavior-Driven Development
```gherkin
# Ejemplo: Creación de PQRSD
Feature: PQRSD Creation
  As a citizen
  I want to submit a PQRSD
  So that I can request services from the organization

  Scenario: Successful PQRSD submission
    Given I have valid PQRSD data
    When I submit the PQRSD
    Then I should receive a filing number
    And I should receive an access code
    And the PQRSD should be in "RECIBIDA" status
```

### 3.2 Integración Continua / Despliegue Continuo (CI/CD)

#### 3.2.1 Pipeline de CI/CD
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:cov
      - name: Run linting
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build application
        run: npm run build
      - name: Run security scan
        run: npm audit

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    # Deployment steps...

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    # Deployment steps...
```

#### 3.2.2 Automatización de Calidad
- **Pre-commit hooks**: ESLint, Prettier, tests
- **Code coverage**: Mínimo 80%
- **Security scanning**: SAST/DAST automático
- **Performance testing**: Lighthouse CI

### 3.3 Code Reviews y Pair Programming

#### 3.3.1 Proceso de Code Review
1. **Pull Request**: Descripción clara de cambios
2. **Automated Checks**: Tests, linting, security
3. **Peer Review**: Mínimo 2 aprobaciones
4. **Approval**: Product Owner para features críticas

#### 3.3.2 Pair Programming Sessions
- **Driver-Navigator**: Rotación de roles
- **Mobbing**: Sesiones con todo el equipo
- **Remote Pairing**: Uso de herramientas como Tuple
- **Knowledge Sharing**: Difusión de conocimientos

### 3.4 Refactoring Continuo

#### 3.4.1 Principios Aplicados
- **SOLID Principles**: Diseño orientado a objetos
- **DRY (Don't Repeat Yourself)**
- **KISS (Keep It Simple, Stupid)**
- **YAGNI (You Aren't Gonna Need It)**

#### 3.4.2 Técnicas de Refactoring
```typescript
// Antes: Método largo y complejo
async create(createPqrsdDto: CreatePqrsdDto): Promise<PqrsdRequest> {
  // Validación, generación de número, cálculo de fecha, guardado...
}

// Después: Método dividido y legible
async create(createPqrsdDto: CreatePqrsdDto): Promise<PqrsdRequest> {
  this.validatePqrsdData(createPqrsdDto);
  const filingNumber = await this.generateFilingNumber();
  const dueDate = this.calculateDueDate(createPqrsdDto.type);
  const accessCode = this.generateAccessCode();

  const pqrsd = this.buildPqrsdEntity(createPqrsdDto, filingNumber, dueDate, accessCode);
  return this.savePqrsd(pqrsd);
}
```

---

## 4. Métricas Ágiles

### 4.1 Métricas de Equipo

#### 4.1.1 Velocity
- **Cálculo**: Story Points completados por Sprint
- **Objetivo**: 40-60 puntos por Sprint (2 semanas)
- **Tracking**: Gráfico de velocity en Jira/Azure DevOps

#### 4.1.2 Burndown Chart
- **Diario**: Progreso real vs. planeado
- **Tendencias**: Identificación de problemas tempranos
- **Ajustes**: Re-planificación cuando es necesario

#### 4.1.3 Cycle Time
- **Medición**: Desde commit hasta producción
- **Objetivo**: < 1 semana para features críticas
- **Mejora**: Optimización del pipeline

### 4.2 Métricas de Calidad

#### 4.2.1 Lead Time
- **Definición**: Tiempo desde idea hasta entrega
- **Objetivo**: < 2 semanas para features estándar
- **Monitoreo**: Dashboard en tiempo real

#### 4.2.2 Deployment Frequency
- **Frecuencia**: Múltiples despliegues por día
- **Objetivo**: Despliegue continuo
- **Automatización**: Pipeline completamente automatizado

#### 4.2.3 Change Failure Rate
- **Medición**: Porcentaje de despliegues con fallos
- **Objetivo**: < 5%
- **Rollback**: Estrategia de rollback automático

### 4.3 Métricas de Producto

#### 4.3.1 Customer Satisfaction
- **Método**: Encuestas post-Sprint Review
- **Escala**: 1-5 (promedio objetivo: 4.2+)
- **Acciones**: Mejora basada en feedback

#### 4.3.2 Business Value Delivered
- **Medición**: Valor de negocio por Sprint
- **ROI**: Retorno de inversión de features
- **Priorización**: Impacto vs. esfuerzo

---

## 5. Herramientas Ágiles

### 5.1 Gestión de Proyecto
- **Jira/Azure DevOps**: Gestión de backlog y sprints
- **Confluence**: Documentación colaborativa
- **Miro/Mural**: Sesiones de brainstorming

### 5.2 Comunicación
- **Microsoft Teams/Slack**: Comunicación diaria
- **Zoom**: Reuniones y pair programming
- **Outlook**: Comunicación formal

### 5.3 Desarrollo
- **Git**: Control de versiones
- **GitHub/GitLab**: Repositorio y CI/CD
- **VS Code**: IDE principal
- **Docker**: Contenedorización

### 5.4 Monitoreo
- **Grafana**: Dashboards de métricas
- **Application Insights**: Telemetría de aplicación
- **Azure Monitor**: Monitoreo de infraestructura

---

## 6. Retrospectivas y Mejora Continua

### 6.1 Formatos de Retrospectiva

#### 6.1.1 Start, Stop, Continue
- **Start**: Nuevas prácticas a implementar
- **Stop**: Prácticas a eliminar
- **Continue**: Prácticas que funcionan bien

#### 6.1.2 Sailboat Retrospective
- **Viento a favor**: Lo que nos ayuda
- **Viento en contra**: Impedimentos
- **Rocas**: Riesgos potenciales
- **Isla**: Objetivo a alcanzar

### 6.2 Acciones de Mejora

#### 6.2.1 Backlog de Mejora
- Lista de acciones identificadas en retrospectivas
- Priorización por impacto y esfuerzo
- Seguimiento de implementación

#### 6.2.2 Experimentos Ágiles
- Pruebas de nuevas prácticas
- Medición de resultados
- Decisión de adopción o abandono

### 6.3 Indicadores de Salud del Equipo

#### 6.3.1 Happiness Index
- Encuesta semanal de satisfacción
- Identificación de problemas culturales
- Acciones correctivas proactivas

#### 6.3.2 Team Health Check
- Evaluación mensual de 8 dimensiones:
  - Colaboración
  - Comunicación
  - Respeto
  - Aprendizaje
  - Salud
  - Productividad
  - Calidad
  - Innovación

---

## 7. Escalabilidad y Sostenibilidad

### 7.1 Crecimiento del Equipo
- **Onboarding**: Proceso estandarizado para nuevos miembros
- **Mentoring**: Programa de mentores para juniors
- **Knowledge Sharing**: Sesiones técnicas semanales

### 7.2 Escalabilidad de Procesos
- **Múltiples equipos**: Framework para scaled agile (LeSS/SAFe)
- **Coordinación**: Comunidades of Practice
- **Governance**: Mantenimiento de estándares

### 7.3 Sostenibilidad Técnica
- **Deuda técnica**: Gestión activa y reducción
- **Modernización**: Actualización de tecnologías
- **Documentación**: Mantenimiento de documentación viva

---

## 8. Lecciones Aprendidas

### 8.1 Éxitos
- **Adopción rápida**: Transición smooth a prácticas ágiles
- **Mejora de calidad**: Reducción significativa de defectos
- **Satisfacción del equipo**: Mayor engagement y motivación
- **Entrega de valor**: Releases más frecuentes y predictibles

### 8.2 Desafíos
- **Resistencia al cambio**: Superación mediante comunicación
- **Coordinación**: Mejora con herramientas y procesos
- **Medición**: Refinamiento continuo de métricas
- **Escalabilidad**: Adaptación para crecimiento del equipo

### 8.3 Mejores Prácticas
- **Transparencia**: Comunicación abierta y honesta
- **Confianza**: Empowerment del equipo
- **Experimentación**: Prueba de nuevas ideas
- **Aprendizaje**: Cultura de mejora continua

---

**Fin del Documento**  
**Próxima revisión:** [Fecha del próximo Sprint Review]  
**Responsable:** [Scrum Master]</content>
<parameter name="filePath">c:\Users\USUARIO\Desktop\PQRSD\API\docs\agile-practices.md
