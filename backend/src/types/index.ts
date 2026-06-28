import { Request } from 'express';

export interface UserPayload {
  id: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}
