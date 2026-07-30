import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '@/prisma';
import { hashPassword, comparePassword, generateCryptoToken } from '@/utils/crypto';
import { createToken } from '@/utils/jwt';
import { sendEmailTemplate } from '@/utils/mail';
import { AuthRequest } from '@/middleware/auth.middleware';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { nama, username, email, password, address, tanggalLahir, role } = req.body;

      if (!nama || !username || !email || !password) {
        return res.status(400).send({ message: 'Nama, username, email, and password are required.' });
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        return res.status(400).send({ message: 'Username or email already exists.' });
      }

      const hashedPassword = hashPassword(password);
      const emailVerifyToken = generateCryptoToken();

      const newUser = await prisma.$transaction(async (tx: any) => {
        const user = await tx.user.create({
          data: {
            nama,
            username,
            email,
            password: hashedPassword,
            role: role || 'user',
            address,
            tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
            isVerified: true, // Auto-verify on register for immediate login
            token: emailVerifyToken,
            verifyTokenExpiry: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes
          },
        });

        await tx.balance.create({
          data: {
            userId: user.id,
            saldo: 0,
          },
        });

        return user;
      });

      // Send verification email
      const verifyUrl = `${process.env.FE_URL || 'http://localhost:3000'}/verify-email?token=${emailVerifyToken}`;
      await sendEmailTemplate(email, 'Verifikasi Email - Penginapan App', {
        name: nama,
        title: 'Verifikasi Email Anda',
        message: 'Terima kasih telah mendaftar. Silakan klik tombol di bawah untuk memverifikasi email Anda. Link ini berlaku selama 20 menit.',
        link: verifyUrl,
        buttonText: 'Verifikasi Email',
        email,
      }, 'VerifyEmail');

      const { password: _, token: __, verifyTokenExpiry: ___, ...userWithoutPassword } = newUser;

      return res.status(201).send({
        message: 'User registered successfully. You can login immediately. Please check your email for account information.',
        user: userWithoutPassword,
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password, keepLogin } = req.body;

      if (!email || !password) {
        return res.status(400).send({ message: 'Email and password are required.' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          balance: true,
        },
      });

      if (!user || !comparePassword(password, user.password)) {
        return res.status(401).send({ message: 'Invalid credentials.' });
      }

      // Auto-verify email on successful login
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });

      // Generate a JWT token including role
      const token = createToken(
        { id: user.id, username: user.username, email: user.email, role: user.role },
        keepLogin
      );

      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).send({
        message: 'Login successful',
        user: userWithoutPassword,
        token,
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async keepLogin(req: AuthRequest, res: Response) {
    try {
      const decoded = req.user;

      if (!decoded || !decoded.id) {
        return res.status(401).send({ message: 'Invalid token payload.' });
      }

      const user = await prisma.user.findUnique({
        where: { id: String(decoded.id) },
        include: {
          balance: true,
        },
      });

      if (!user) {
        return res.status(404).send({ message: 'User not found.' });
      }

      // Refresh token
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
      );

      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).send({
        message: 'Token verified successfully',
        user: userWithoutPassword,
        token,
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).send({ message: 'Email is required.' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Return a generic success message to prevent user enumeration
        return res.status(200).send({
          message: 'If the email is registered, a password reset link has been sent.',
        });
      }

      // Create a short-lived token (15 minutes) for reset password
      const resetToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: '15m' }
      );

      // Send email using Handlebars template helper
      const resetUrl = `${process.env.FE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      await sendEmailTemplate(user.email, 'Reset Password - Penginapan App', {
        name: user.nama,
        title: 'Reset Password Anda',
        message: 'Kami menerima permintaan untuk reset password. Silakan klik tombol di bawah untuk mengatur password baru. Link ini berlaku selama 15 menit.',
        link: resetUrl,
        buttonText: 'Reset Password',
        email: user.email,
      }, 'ResetPass');

      return res.status(200).send({
        message: 'If the email is registered, a password reset link has been sent.',
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).send({ message: 'Token and newPassword are required.' });
      }

      // Verify reset token
      let decoded: any;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      } catch (err: any) {
        return res.status(400).send({ message: 'Invalid or expired token.', error: err.message });
      }

      // Update password
      const hashedPassword = hashPassword(newPassword);
      await prisma.user.update({
        where: { id: decoded.id },
        data: { password: hashedPassword },
      });

      return res.status(200).send({ message: 'Password has been reset successfully.' });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).send({ message: 'Token is required.' });
      }

      const user = await prisma.user.findFirst({
        where: { token },
      });

      if (!user) {
        return res.status(404).send({ message: 'Token not found or already used.' });
      }

      // Check if token has expired (20 minutes)
      if (user.verifyTokenExpiry && user.verifyTokenExpiry < new Date()) {
        return res.status(400).send({
          message: 'Verification link has expired (more than 20 minutes). Please register again.',
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          token: null,
          verifyTokenExpiry: null,
        },
      });

      return res.status(200).send({
        message: 'Email verified successfully. You can now login.',
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }
}
