import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

// Use Ethereal for testing if no SMTP credentials provided
let transporter: nodemailer.Transporter;

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  // Create test account using Ethereal for development
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'test@ethereal.email',
      pass: 'test',
    },
  });
  console.log('⚠️  SMTP credentials not configured. Using Ethereal test account. Configure SMTP_USER and SMTP_PASS in .env for real email delivery.');
} else {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: Number(process.env.SMTP_PORT) || 2525,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export const sendEmailTemplate = async (
  to: string,
  subject: string,
  templateData: {
    name: string;
    title: string;
    message: string;
    link?: string;
    buttonText?: string;
    email?: string;
  },
  templateType: 'ResetPass' | 'VerifyEmail' = 'VerifyEmail',
  from?: string
) => {
  try {
    // Try to load template based on type
    let pathsToTry = [
      path.join(__dirname, '../templates/Report.hbs'),
      path.join(__dirname, '../../src/templates/Report.hbs'),
      path.join(__dirname, './Report.hbs'),
    ];
    let templateSource = fs.readFileSync(pathsToTry[0], 'utf-8');
    let template = handlebars.compile(templateSource);

    if (!templateSource) {
      templateSource = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Laporan Masalah Baru</h2>
          <p><strong>Nama:</strong> {{name}}</p>
          <p><strong>Email:</strong> {{email}}</p>
          <p><strong>Subjek:</strong> {{subject}}</p>
          <p><strong>Pesan:</strong></p>
          <p style="white-space: pre-wrap;">{{message}}</p>
        </div>
      `;
    }


    const html = template({ ...templateData, subject });

    const info = await transporter.sendMail({
      from: from || process.env.SMTP_FROM || '"Penginapan App" <noreply@penginapanapp.com>',
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export const sendReportEmail = async (
  templateData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }
) => {
  try {
    let templateSource = '';
    const pathsToTry = [
      path.join(__dirname, '../templates/Report.hbs'),
      path.join(__dirname, '../../src/templates/Report.hbs'),
      path.join(__dirname, './Report.hbs'),
    ];

    for (const p of pathsToTry) {
      if (fs.existsSync(p)) {
        templateSource = fs.readFileSync(p, 'utf-8');
        break;
      }
    }

    if (!templateSource) {
      templateSource = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Laporan Masalah Baru</h2>
          <p><strong>Nama:</strong> {{name}}</p>
          <p><strong>Email:</strong> {{email}}</p>
          <p><strong>Subjek:</strong> {{subject}}</p>
          <p><strong>Pesan:</strong></p>
          <p style="white-space: pre-wrap;">{{message}}</p>
        </div>
      `;
    }

    const template = handlebars.compile(templateSource);
    const html = template(templateData);

    const toEmail = process.env.ADMIN_REPORT_EMAIL || 'bluekraken99999@gmail.com';

    const info = await transporter.sendMail({
      from: '"Report System" <noreply@penginapanapp.com>',
      to: toEmail,
      subject: `[Report] ${templateData.subject}`,
      html,
    });
    return info;
  } catch (error) {
    console.error('Report email sending failed:', error);
    throw error;
  }
};

