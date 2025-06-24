import nodemailer from 'nodemailer';

interface NotificationConfig {
  gmail?: {
    user: string;
    pass: string;
  };
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from?: string;
}

interface SecretBurnNotification {
  secretId: string;
  ownerEmail?: string;
  viewedAt: Date;
  viewerIP?: string;
  secretPreview?: string;
}

class NotificationService {
  private config: NotificationConfig;
  private transporter?: nodemailer.Transporter;
  constructor() {
    this.config = {
      gmail: process.env.GMAIL_USER && process.env.GMAIL_PASS ? {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      } : undefined,
      smtp: process.env.SMTP_HOST ? {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      } : undefined,
      from: process.env.GMAIL_USER || process.env.SMTP_FROM || process.env.SMTP_USER,
    };    // Prioritize Gmail over custom SMTP for simplicity
    if (this.config.gmail) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.config.gmail.user,
          pass: this.config.gmail.pass,
        },
      });
    } else if (this.config.smtp) {
      // Custom SMTP fallback (kept for flexibility but Gmail preferred)
      this.transporter = nodemailer.createTransport(this.config.smtp);
    }
  }

  async sendSecretBurnNotification(notification: SecretBurnNotification): Promise<boolean> {
    if (!this.transporter || !notification.ownerEmail) {
      console.log('Secret burn notification (email not configured):', {
        secretId: notification.secretId,
        viewedAt: notification.viewedAt,
        viewerIP: notification.viewerIP,
      });
      return false;
    }

    try {
      const emailHtml = this.generateSecretBurnEmail(notification);
      
      await this.transporter.sendMail({
        from: this.config.from,
        to: notification.ownerEmail,
        subject: 'Your secret has been viewed - SecretShare',
        html: emailHtml,
        text: this.generateSecretBurnText(notification),
      });

      console.log('Secret burn notification sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send secret burn notification:', error);
      return false;
    }
  }

  private generateSecretBurnEmail(notification: SecretBurnNotification): string {
    const { secretId, viewedAt, viewerIP, secretPreview } = notification;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Secret Viewed - SecretShare</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px 20px; border-radius: 0 0 8px 8px; }
            .alert { background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .info-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .burn-icon { font-size: 48px; margin-bottom: 10px; color: #e74c3c; }
            .burn-icon::before { content: "BURNED"; font-weight: bold; font-size: 24px; }
          </style>
        </head>
        <body>
          <div class="container">            <div class="header">
              <div class="burn-icon"></div>
              <h1>Secret Viewed & Destroyed</h1>
              <p>Your secret has been accessed and permanently deleted</p>
            </div>
            <div class="content">              <div class="alert">
                <strong>AUTOMATED NOTIFICATION</strong><br>
                One of your secrets has been viewed and is now permanently deleted for security.
              </div>
                <div class="info-box">
                <h3>View Details</h3>
                <p><strong>Secret ID:</strong> ${secretId}</p>
                <p><strong>Viewed At:</strong> ${viewedAt.toLocaleString()}</p>
                ${viewerIP ? `<p><strong>Viewer IP:</strong> ${viewerIP}</p>` : ''}
                ${secretPreview ? `<p><strong>Secret Preview:</strong> ${secretPreview}...</p>` : ''}
              </div>              <div class="info-box">
                <h3>What Happened?</h3>
                <p>Your secret was configured for one-time access and has been viewed by someone with the link. For security reasons, the secret has been permanently deleted from our servers.</p>
              </div>              <div class="info-box">
                <h3>Security Notice</h3>
                <p>If you did not expect this secret to be viewed, please ensure you only share secret links with intended recipients. Consider using password protection for additional security in the future.</p>
              </div>
            </div>
            <div class="footer">
              <p>SecretShare - Secure Ephemeral Secret Sharing</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateSecretBurnText(notification: SecretBurnNotification): string {
    const { secretId, viewedAt, viewerIP, secretPreview } = notification;
      return `
SECRET VIEWED & DESTROYED - SecretShare

Your secret has been accessed and permanently deleted.

View Details:
- Secret ID: ${secretId}
- Viewed At: ${viewedAt.toLocaleString()}
${viewerIP ? `- Viewer IP: ${viewerIP}` : ''}
${secretPreview ? `- Secret Preview: ${secretPreview}...` : ''}

What Happened?
Your secret was configured for one-time access and has been viewed by someone with the link. For security reasons, the secret has been permanently deleted from our servers.

Security Notice:
If you did not expect this secret to be viewed, please ensure you only share secret links with intended recipients. Consider using password protection for additional security in the future.

---
SecretShare - Secure Ephemeral Secret Sharing
This is an automated message.
    `.trim();
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection test failed:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();

export type { SecretBurnNotification, NotificationConfig };
