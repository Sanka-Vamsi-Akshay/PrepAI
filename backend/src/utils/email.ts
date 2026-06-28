import { logger } from '@backend/config/logger';

export interface EmailProvider {
  sendEmail(to: string, subject: string, htmlContent: string): Promise<void>;
}

export class ConsoleEmailProvider implements EmailProvider {
  async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    logger.info(`✉️ [Email Sent]
To: ${to}
Subject: ${subject}
Content Preview: ${htmlContent.substring(0, 150)}...
--------------------------------------------------`);
  }
}

// Global active email provider instance
export const emailProvider: EmailProvider = new ConsoleEmailProvider();

export const sendEvaluationCompletedEmail = async (
  to: string,
  name: string,
  sessionTitle: string,
  sessionId: string
): Promise<void> => {
  const subject = `PrepAI - Evaluation Completed: ${sessionTitle}`;
  const htmlContent = `
    <h1>Hello, ${name}!</h1>
    <p>Your mock interview session <strong>"${sessionTitle}"</strong> has been successfully evaluated by our AI.</p>
    <p>You can view your multi-dimensional scores, recommendations, and individual question feedback by visiting the link below:</p>
    <p><a href="http://localhost:8080/interviews/${sessionId}">View My Evaluation Report</a></p>
    <br/>
    <p>Best regards,<br/>The PrepAI Team</p>
  `;
  await emailProvider.sendEmail(to, subject, htmlContent);
};
