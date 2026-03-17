import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, { accessToken: result.accessToken, user: result.user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    sendError(res, 401, 'AUTH_FAILED', message);
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      sendError(res, 401, 'NO_TOKEN', 'No refresh token provided');
      return;
    }

    const result = await authService.refresh(refreshToken);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, { accessToken: result.accessToken });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Token refresh failed';
    sendError(res, 401, 'REFRESH_FAILED', message);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('refreshToken');
  sendSuccess(res, { message: 'Logged out successfully' });
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
      return;
    }
    const profile = await authService.getProfile(req.user.userId);
    sendSuccess(res, profile);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'User not found';
    sendError(res, 404, 'NOT_FOUND', message);
  }
}

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
      return;
    }
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.userId, currentPassword, newPassword);
    sendSuccess(res, { message: 'Password changed successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Password change failed';
    sendError(res, 400, 'PASSWORD_CHANGE_FAILED', message);
  }
}
