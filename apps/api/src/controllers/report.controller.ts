import { Request, Response } from 'express';
import { sendReportEmail } from '@/utils/mail';

export class ReportController {
  async sendReport(req: Request, res: Response) {
    try {
      const { name, email, subject, message } = req.body;

      // Input validation
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).send({ message: 'Name is required.' });
      }

      if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).send({ message: 'Email is required.' });
      }

      // Simple email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).send({ message: 'Invalid email format.' });
      }

      if (!subject || typeof subject !== 'string' || !subject.trim()) {
        return res.status(400).send({ message: 'Subject is required.' });
      }

      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).send({ message: 'Message is required.' });
      }

      // Send the email
      await sendReportEmail({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      return res.status(200).send({
        success: true,
        message: 'Laporan Anda telah berhasil kami kirimkan ke email admin dan akan segera diproses.',
      });
    } catch (error: any) {
      console.error('Error in sendReport controller:', error);
      return res.status(500).send({
        message: 'Internal server error',
        error: error.message || 'Gagal mengirimkan laporan.',
      });
    }
  }
}
