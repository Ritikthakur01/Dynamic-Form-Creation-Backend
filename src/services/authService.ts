import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  username: string;
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    // Find admin by username (case-insensitive)
    const admin = await Admin.findOne({
      username: credentials.username.toLowerCase(),
    });

    if (!admin) {
      throw {
        statusCode: 401,
        message: 'Invalid credentials',
      };
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(credentials.password);

    if (!isPasswordValid) {
      throw {
        statusCode: 401,
        message: 'Invalid credentials',
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: admin.username, id: admin._id },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return {
      token,
      username: admin.username,
    };
  }

  verifyToken(token: string): { username: string; id: string } {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      return jwt.verify(token, jwtSecret) as { username: string; id: string };
    } catch (error) {
      throw {
        statusCode: 401,
        message: 'Invalid or expired token',
      };
    }
  }
}
