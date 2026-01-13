import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface DecodedToken extends jwt.JwtPayload {
    id: string;
}

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.cookies && req.cookies.jwt) {
        try {
            token = req.cookies.jwt;
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

            // Sequelize: findByPk
            const user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (user) {
                req.user = user;
                next();
            } else {
                res.status(401).json({ message: 'Not authorized, user not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
