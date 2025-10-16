import { NextFunction, Request, Response } from 'express';

export function notFound(_req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({ success: false, message: 'Not Found' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
}
