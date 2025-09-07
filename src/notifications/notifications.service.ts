import { Injectable, Logger } from '@nestjs/common';
// Use require to avoid missing type declarations in environments without @types/nodemailer
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodemailer: any = require('nodemailer');
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PqrsdRequest } from '../entities/pqrsd-request.entity';
import { User } from '../entities/user.entity';
import { PqrsdStatus } from '../common/enums/pqrsd-status.enum';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(PqrsdRequest)
    private pqrsdRepository: Repository<PqrsdRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkOverdueRequests() {
    this.logger.log('Verificando PQRSD vencidas...');

    const overdueRequests = await this.pqrsdRepository.find({
      where: {
        dueDate: LessThan(new Date()),
        status: PqrsdStatus.CERRADA,
      },
      relations: ['assignedUser', 'assignedDepartment'],
    });

    if (overdueRequests.length > 0) {
      this.logger.warn(`Se encontraron ${overdueRequests.length} PQRSD vencidas`);
      
      // En una implementación real, aquí enviarías emails o notificaciones
      for (const request of overdueRequests) {
        await this.sendOverdueNotification(request);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async checkUpcomingDeadlines() {
    this.logger.log('Verificando PQRSD próximas a vencer...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingDeadlines = await this.pqrsdRepository.find({
      where: {
        dueDate: LessThan(tomorrow),
        status: PqrsdStatus.CERRADA,
      },
      relations: ['assignedUser', 'assignedDepartment'],
    });

    if (upcomingDeadlines.length > 0) {
      this.logger.log(`Se encontraron ${upcomingDeadlines.length} PQRSD próximas a vencer`);
      
      for (const request of upcomingDeadlines) {
        await this.sendDeadlineReminderNotification(request);
      }
    }
  }

  private async sendOverdueNotification(request: PqrsdRequest) {
    // En una implementación real, implementarías el envío de emails
    this.logger.warn(
      `PQRSD vencida: ${request.filingNumber} - ${request.subject}`
    );
  }

  private async sendDeadlineReminderNotification(request: PqrsdRequest) {
    // En una implementación real, implementarías el envío de emails
    this.logger.log(
      `Recordatorio: PQRSD ${request.filingNumber} vence pronto`
    );
  }

  async sendStatusChangeNotification(request: PqrsdRequest, newStatus: string) {
    // En una implementación real, notificarías al peticionario
    this.logger.log(
      `Estado cambiado para PQRSD ${request.filingNumber}: ${newStatus}`
    );
  }

  async sendAssignmentNotification(request: PqrsdRequest, assignedUser: User) {
    // En una implementación real, notificarías al usuario asignado
    this.logger.log(
      `PQRSD ${request.filingNumber} asignada a ${assignedUser.firstName} ${assignedUser.lastName}`
    );
  }

  private getTransport() {
    // Decide mail transport mode: force Mailpit in non-production or when MAILPIT=true
    const forceMailpit = process.env.MAILPIT === 'true' || process.env.NODE_ENV !== 'production';

    if (forceMailpit) {
      const mpHost = process.env.SMTP_HOST || '127.0.0.1';
      const mpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 1025;
      this.logger.log(`Using Mailpit transport host=${mpHost} port=${mpPort}`);
      const transport = nodemailer.createTransport({
        host: mpHost,
        port: mpPort,
        secure: false,
        ignoreTLS: true,
      });

      transport.verify((err: any, success: any) => {
        if (err) {
          this.logger.error('SMTP verify failed (mailpit)', err);
        } else {
          this.logger.log('SMTP verify success (mailpit)');
        }
      });

      return transport;
    }

    const host = process.env.SMTP_HOST || 'smtp.office365.com';
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
      this.logger.warn('SMTP configuration missing for remote SMTP; emails will not be sent');
      return null;
    }

    // Mask user for logs
    const maskedUser = user ? user.replace(/(.{2}).+(.{2}@.+)/, '$1****$2') : 'unknown';
    this.logger.log(`Using SMTP host=${host} port=${port} user=${maskedUser}`);

    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      requireTLS: true,
      tls: { rejectUnauthorized: false },
    });

    // Verify transporter quickly to expose auth/connection errors early
    transport.verify((err: any, success: any) => {
      if (err) {
        this.logger.error('SMTP verify failed', err);
      } else {
        this.logger.log('SMTP verify success');
      }
    });

    return transport;
  }

  async sendPqrsdCreatedEmail(email: string, filingNumber: string, accessCode: string) {
    const transport = this.getTransport();
    if (!transport) return;

  // Support FROM_EMAIL (used in .env) and MAIL_FROM for compatibility
  const from = process.env.FROM_EMAIL || process.env.MAIL_FROM || 'no-reply@example.com';
    const subject = `Registro PQRSD ${filingNumber}`;
    const text = `Su PQRSD ha sido creada.\n\nNúmero de radicado: ${filingNumber}\nCódigo de acceso: ${accessCode}\n\nCon estos datos podrá consultar el estado en el portal.`;

    try {
      await transport.sendMail({
        from,
        to: email,
        subject,
        text,
      });
      this.logger.log(`Sent PQRSD creation email to ${email} for ${filingNumber}`);
    } catch (err) {
      this.logger.error('Failed to send PQRSD creation email', err as any);
      throw err;
    }
  }
}