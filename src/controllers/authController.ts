// import { Request, Response } from 'express';
// import bcrypt from 'bcrypt';
// // import jwt from 'jsonwebtoken';
// // import dotenv from 'dotenv';
// // import nodemailer from 'nodemailer';
// import User from '../models/User';
// // import UserDetails from '../models/UserDetails';

// // dotenv.config();

// // const JWT_SECRET = process.env.JWT_SECRET as string; // Ensure JWT_SECRET is defined in the environment variables

// // Define the request body type
// interface SignupRequestBody {
//   username: string;
//   usertype: 'admin'; // Assuming usertype can only be 'admin'
//   email: string;
//   password: string;
// }

// const validateEmail = (email: string): boolean => {
//   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//   return emailRegex.test(email);
// };

// export const signup = async (req: Request<{}, {}, SignupRequestBody>, res: Response): Promise<void> => {
//   const { username, usertype, email, password } = req.body;

//   if (!validateEmail(email)) {
//     res.status(400).json({ message: 'Invalid email format' });
//     return;
//   }

//   const emailLowerCase = email.toLowerCase();

//   try {
//     const existingUser = await User.findOne({ $or: [{ username }, { email: emailLowerCase }] });

//     if (existingUser) {
//       res.status(400).json({ message: 'Username or Email already exists' });
//       return;
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       username,
//       usertype,
//       email: emailLowerCase,
//       password: hashedPassword,
//     });

//     await newUser.save();

//     res.status(201).json({ message: 'User registered successfully', user: { username, email, usertype } });
//   } catch (error) {
//     console.error('Error in signup:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import User from '../models/User';
import UserDetails from '../models/UserDetails';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

interface SignupRequestBody {
  username: string;
  usertype: 'admin'; 
  email: string;
  password: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

interface DecodedToken extends JwtPayload {
    email: string;
  }

interface ForgotPasswordRequestBody {
  email: string;
}

interface VerificationOtpRequestBody {
  otp: string;
  forgotpasswordtoken: string;
}

interface ResetPasswordRequestBody {
  newPassword: string;
  otpToken: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const signup = async (req: Request<{}, {}, SignupRequestBody>, res: Response): Promise<void> => {
  const { username, usertype, email, password } = req.body;

  if (!validateEmail(email)) {
    return<any> res.status(400).json({ message: 'Invalid email format' });
  }

  const emailLowerCase = email.toLowerCase();

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email: emailLowerCase }] });

    if (existingUser) {
      return<any> res.status(400).json({ message: 'Username or Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      usertype,
      email: emailLowerCase,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: { username, email, usertype } });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<void> => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return<any> res.status(400).json({ message: 'Email and password are required' });
    }
  
    try {
      const emailLowerCase = email.toLowerCase();
      const user = await User.findOne({ email: emailLowerCase });
  
      if (!user) {
        return<any> res.status(404).json({ message: 'User not found' });
      }
  
    //   console.log('Provided Password:', password);
    //   console.log('Stored Hashed Password:', user.password);
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return<any> res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign(
        { id: user._id, usertype: user.usertype, email: user.email, username: user.username },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
  
      const existingDetails = await UserDetails.findOne({ userId: user._id });
      if (!existingDetails) {
        const newDetails = new UserDetails({
          userId: user._id,
          email: user.email,
        });
        await newDetails.save();
      }
  
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
export const forgotpassword = async (req: Request<{}, {}, ForgotPasswordRequestBody>, res: Response): Promise<void> => {
  const { email } = req.body;

  const emailLowerCase = email.toLowerCase();

  try {
    const existingUser = await User.findOne({ email: emailLowerCase });

    if (!existingUser) {
      return<any> res.status(404).json({ message: 'Email not found' });
    }

    const forgotpasswordtoken = jwt.sign(
      { email: emailLowerCase },
      process.env.JWT_SECRET as string,
      { expiresIn: '5m' }
    );

    const otp = Math.random().toString().slice(2, 6);

    await User.findOneAndUpdate(
      { email },
      { userotp: otp }
    );

    const mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'veeruadimulam@gmail.com',
        pass: 'hxrc ivza tgiz tcmn',
      },
    });

    const mailDetails = {
      from: 'veeruadimulam@gmail.com',
      to: email,
      subject: 'Your OTP for Password Reset',
      text: `Your OTP for resetting the password is: ${otp}. This OTP is valid for 5 minutes.`,
    };

    mailTransporter.sendMail(mailDetails, (err:any, data:any) => {
      if (err) {
        console.error('Error while sending email:', err);
        return res.status(500).json({ message: 'Failed to send email' });
      } else {
        console.log('Email sent successfully');
      }
    });

    return<any> res.status(200).json({
      message: 'OTP sent to your email successfully',
      forgotpasswordtoken,
    });
  } catch (error) {
    console.error('Error in forgotpassword:', error);
    return<any> res.status(500).json({ message: 'Server error' });
  }
};

export const verificationOtp = async (req: Request<{}, {}, VerificationOtpRequestBody>, res: Response): Promise<void> => {
  const { otp, forgotpasswordtoken } = req.body;

  try {
    const decoded = jwt.verify(forgotpasswordtoken, process.env.JWT_SECRET as string) as DecodedToken;

    const user = await User.findOne({ email: decoded.email, userotp: otp });

    if (!user) {
      return<any> res.status(400).json({ message: 'Invalid token or OTP' });
    }

    const otpToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '10m' }
    );

    user.userotp = null;
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully', otpToken });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return<any> res.status(401).json({ message: 'Token expired. Please request a new OTP.' });
    }
  
    console.error('Error in verificationotp:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetpassword = async (req: Request<{}, {}, ResetPasswordRequestBody>, res: Response): Promise<void> => {
  const { newPassword, otpToken } = req.body;

  if (!newPassword) {
    return<any> res.status(400).json({ message: 'New password is required' });
  }

  try {
    // const decoded = jwt.verify(otpToken, process.env.JWT_SECRET as string);
    const decoded = jwt.verify(otpToken, process.env.JWT_SECRET as string) as DecodedToken;


    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return<any> res.status(404).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.userotp = null;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return<any> res.status(401).json({ message: 'Token expired. Please request a new OTP.' });
    }
  
    console.error('Error in resetpassword:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
