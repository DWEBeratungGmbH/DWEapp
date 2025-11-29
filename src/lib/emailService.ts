import { Client } from '@microsoft/microsoft-graph-client'
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client'

// Simple auth provider for Microsoft Graph
class SimpleAuthProvider implements AuthenticationProvider {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async getAccessToken(): Promise<string> {
    return this.accessToken
  }
}

export class EmailService {
  private client: Client

  constructor(accessToken: string) {
    const authProvider = new SimpleAuthProvider(accessToken)
    this.client = Client.initWithMiddleware({ authProvider })
  }

  async sendInvitationEmail(
    toEmail: string,
    toName: string,
    inviteUrl: string,
    inviterName: string,
    inviterEmail: string
  ): Promise<void> {
    try {
      console.log(`Preparing to send email from ${inviterEmail} to ${toEmail}`)
      
      // 1. Application Flow: User ID finden (nötig für Application Permissions)
      let userId = null
      try {
        // Suche User nach E-Mail um die Object ID zu bekommen
        const userResponse = await this.client.api('/users').filter(`mail eq '${inviterEmail}'`).get()
        if (userResponse.value && userResponse.value.length > 0) {
          userId = userResponse.value[0].id
          console.log(`✅ Found M365 User ID: ${userId} for ${inviterEmail}`)
        } else {
          console.warn(`⚠️ No M365 User ID found for ${inviterEmail}. Trying direct email usage...`)
        }
      } catch (findError: any) {
        console.error('⚠️ Error finding user ID:', findError.message)
      }

      const email = {
        message: {
          subject: 'Einladung zur DWE App',
          body: {
            contentType: 'HTML',
            content: this.generateInvitationTemplate(toName, inviteUrl, inviterName)
          },
          toRecipients: [
            {
              emailAddress: {
                address: toEmail
              }
            }
          ],
          from: {
            emailAddress: {
              address: inviterEmail
            }
          },
          replyTo: [
            {
              emailAddress: {
                address: inviterEmail // Antworten gehen an den Einladenden
              }
            }
          ]
        },
        saveToSentItems: false
      }

      // 2. E-Mail senden
      try {
        if (userId) {
          // Beste Methode: Senden via User ID (Application Permissions)
          await this.client.api(`/users/${userId}/sendMail`).post(email)
          console.log(`✅ Email successfully sent via User ID to ${toEmail}`)
        } else {
          // Fallback: Versuch über E-Mail-Adresse (funktioniert oft nicht mit App Permissions)
          await this.client.api(`/users/${inviterEmail}/sendMail`).post(email)
          console.log(`✅ Email successfully sent via direct email to ${toEmail}`)
        }
      } catch (sendError: any) {
        console.error('❌ Send failed:', sendError.message)
        throw sendError
      }
    } catch (error: any) {
      console.error('Full error details:', error)
      throw new Error(`E-Mail konnte nicht gesendet werden: ${error.message}`)
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

// Helper function to get Microsoft Graph access token
export async function getMicrosoftGraphToken(): Promise<string> {
  try {
    const response = await fetch('https://login.microsoftonline.com/' + process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID + '/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_GRAPH_CLIENT_SECRET!,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`Failed to get access token: ${data.error_description}`)
    }

    return data.access_token
  } catch (error) {
    console.error('Error getting Microsoft Graph token:', error)
    throw new Error('Microsoft Graph Authentifizierung fehlgeschlagen')
  }
}
