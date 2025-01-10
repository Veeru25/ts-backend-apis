import express, { Request, Response } from 'express';
import { signup, 
    login, forgotpassword, verificationOtp, resetpassword 
} from '../controllers/authController';

const router = express.Router();

router.post('/signup', (req: Request, res: Response) => signup(req, res));
router.post('/login', (req: Request, res: Response) => login(req, res));
router.post('/forgot-password', (req: Request, res: Response) => forgotpassword(req, res));
router.post('/verification-otp', (req: Request, res: Response) => verificationOtp(req, res));
router.put('/reset-password', (req: Request, res: Response) => resetpassword(req, res));

export default router;
