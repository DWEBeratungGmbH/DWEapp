import nodemailer from 'nodemailer'

export class SMTPEmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: 'intern@dwe-beratung.de',
        pass: process.env.MICROSOFT_365_SMTP_PASSWORD // App Password für das Postfach
      }
    })
  }

  async sendInvitationEmail(
    toEmail: string,
    toName: string,
    inviteUrl: string,
    inviterName: string
  ): Promise<void> {
    try {
      const emailContent = this.generateInvitationTemplate(toName, inviteUrl, inviterName)

      await this.transporter.sendMail({
        from: 'intern@dwe-beratung.de',
        to: toEmail,
        subject: 'Einladung zur DWE App',
        html: emailContent
      })

      console.log(`Invitation email sent to ${toEmail} via SMTP`)
    } catch (error) {
      console.error('Error sending email via SMTP:', error)
      throw new Error('E-Mail konnte nicht gesendet werden')
    }
  }

  private generateInvitationTemplate(
    recipientName: string,
    inviteUrl: string,
    inviterName: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Einladung zur DWE App</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #f9fafb; }
        .button { 
            display: inline-block; 
            background: #2563eb; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
        }
        .footer { 
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DWE App</h1>
        </div>
        <div class="content">
            <h2>Herzlich willkommen, ${recipientName}!</h2>
            <p>${inviterName} hat dich zur DWE App eingeladen.</p>
            <p>Klicke auf den folgenden Button, um die Einladung anzunehmen und dein Konto zu erstellen:</p>
            
            <div style="text-align: center;">
                <a href="${inviteUrl}" class="button">Einladung annehmen</a>
            </div>
            
            <p><strong>Hinweis:</strong> Der Einladungslink ist 7 Tage gültig.</p>
            
            <p>Falls du Fragen hast, kontaktiere uns unter <a href="mailto:inter@dwe-beratung.de">inter@dwe-beratung.de</a></p>
        </div>
        <div class="footer">
            <p>DWE Beratung GmbH | ${new Date().getFullYear()}</p>
        </div>
    </div>
</body>
</html>
    `.trim()
  }
}
