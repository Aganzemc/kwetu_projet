import { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.service';

export async function register(req: Request, res: Response) {
  try {
    const b: any = req.body ?? {};
    console.log('Register body:', b);
    const composedName = (b.firstName && b.lastName)
      ? `${b.firstName} ${b.lastName}`
      : undefined;
    const name = (b.name ?? b.username ?? b.fullName ?? composedName ?? b.user?.name)
      ?.toString()
      ?.trim();
    const email = (b.email ?? b.user?.email)?.toString()?.trim();
    const password = (b.password ?? b.user?.password)?.toString();

    if (!name || !email || !password) {
      const missing: string[] = [];
      if (!name) missing.push('name');
      if (!email) missing.push('email');
      if (!password) missing.push('password');
      return res.status(400).json({ success: false, message: 'Missing fields', missing, receivedKeys: Object.keys(b) });
    }

    const result = await registerUser(name, email, password);

    if ('error' in result) {
      if (result.error === 'EMAIL_IN_USE') {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
    }

    return res.status(201).json({ success: true, data: result.user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const b: any = req.body ?? {};
    console.log('Login body:', b);
    const email = (b.email ?? b.user?.email)?.toString()?.trim();
    const password = (b.password ?? b.user?.password)?.toString();

    if (!email || !password) {
      const missing: string[] = [];
      if (!email) missing.push('email');
      if (!password) missing.push('password');
      return res.status(400).json({ success: false, message: 'Missing fields', missing, receivedKeys: Object.keys(b) });
    }

    const result = await loginUser(email, password);

    if ('error' in result) {
      if (result.error === 'USER_NOT_FOUND') {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      if (result.error === 'INVALID_PASSWORD') {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    }

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
