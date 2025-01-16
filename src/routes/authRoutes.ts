/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - usertype
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               usertype:
 *                 type: string
 *                 enum: [admin]
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Email and password are required
 *       404:
 *         description: User not found
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Initiate the forgot password process
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent to the provided email
 *       404:
 *         description: Email not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/verification-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - forgotpasswordtoken
 *             properties:
 *               otp:
 *                 type: string
 *               forgotpasswordtoken:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid token or OTP
 *       401:
 *         description: Token expired
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/reset-password:
 *   put:
 *     summary: Reset the user's password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *               - otpToken
 *             properties:
 *               newPassword:
 *                 type: string
 *               otpToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       401:
 *         description: Token expired
 *       404:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */


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
