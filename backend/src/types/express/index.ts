import { Document, Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: Document<Types.ObjectId, any, any> & {
        _id: Types.ObjectId;
        name: string;
        email: string;
      };
    }
  }
}