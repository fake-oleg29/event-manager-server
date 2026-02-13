import {
  Injectable,
  UnauthorizedException,
  type NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }

      throw new UnauthorizedException('Invalid token');
    }
  }
}
