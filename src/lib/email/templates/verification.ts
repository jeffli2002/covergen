export interface VerificationEmailData {
  email: string
  verificationUrl: string
  name?: string
}

export function getVerificationEmailTemplate(data: VerificationEmailData) {
  const { email, verificationUrl, name } = data
  const displayName = name || email
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email - CoverGen Pro</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(to right, #3B82F6, #8B5CF6); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                ✨ CoverGen Pro
              </h1>
              <p style="margin: 10px 0 0 0; color: #E0E7FF; font-size: 14px;">
                AI-Powered Cover Generator
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1F2937; font-size: 20px; font-weight: 600;">
                Verify your email address
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #4B5563; font-size: 16px; line-height: 24px;">
                Hi ${displayName},
              </p>
              
              <p style="margin: 0 0 30px 0; color: #4B5563; font-size: 16px; line-height: 24px;">
                Thanks for signing up for CoverGen Pro! Please verify your email address by clicking the button below:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(to right, #F97316, #EF4444); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px 0; color: #6B7280; font-size: 14px; line-height: 20px;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 30px 0; padding: 12px; background-color: #F3F4F6; border-radius: 4px; word-break: break-all; color: #4B5563; font-size: 12px;">
                ${verificationUrl}
              </p>
              
              <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 14px; line-height: 20px;">
                This link will expire in 24 hours for security reasons.
              </p>
              
              <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 20px;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px 40px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 12px;">
                Need help? Contact us at <a href="mailto:support@covergen.pro" style="color: #3B82F6; text-decoration: none;">support@covergen.pro</a>
              </p>
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                © 2025 CoverGen Pro. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  const text = `
Verify your email address

Hi ${displayName},

Thanks for signing up for CoverGen Pro! Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours for security reasons.

If you didn't create an account, you can safely ignore this email.

Need help? Contact us at support@covergen.pro

© 2025 CoverGen Pro. All rights reserved.
`

  return { html, text }
}