import nodemailer from 'nodemailer';

interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Create a transport with Gmail settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || process.env.EMAIL || 'abc@gmail.com',  // Fallback to the provided email
    pass: process.env.EMAIL_PASSWORD || process.env.PASSWORD || 'adff sdfa dsaf afdf',  // Fallback to the provided password
  },
});

export async function sendEmail({ to, subject, text, html }: EmailParams): Promise<boolean> {
  try {
    // Ensure recipient email is properly formatted and log the actual destination
    const recipient = to.trim();
    console.log(`Preparing to send email to: ${recipient}`);
    
    const info = await transporter.sendMail({
      from: `"Epilepsy Alert System" <${process.env.EMAIL_USER || process.env.EMAIL || 'bluemethyl68@gmail.com'}>`,
      to: recipient,
      subject,
      text,
      html: html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #d9534f;">${subject}</h2>
          <div style="white-space: pre-line;">
            ${text}
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #777;">This is an automated alert from the Epilepsy Prediction System. Please do not reply to this email.</p>
        </div>
      `,
    });

    // Log with both the recipient address and message ID for clarity
    console.log(`Email successfully sent to ${recipient} (ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return false;
  }
}