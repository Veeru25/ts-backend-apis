import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import UserDetails from '../models/UserDetails';
import dotenv from 'dotenv';
import { helperFunction } from '../helpers/mongooseHelper';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; usertype: string };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authorization token missing' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; usertype: string };
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error in authentication:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.usertype !== 'admin') {
    res.status(403).json({ message: 'Access denied. Admins only.' });
    return;
  }
  next();
};

export const updateUser = (req: Request, res: Response, next: NextFunction): void => {
  const { userId } = req.params;
  
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
    return;
  }

  if (req.user.id === userId || req.user.usertype === 'admin' || req.user.usertype === 'user') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: You do not have permission to update this data.' });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 3, search } = req.query;

    const searchFilter: any = [];
    if (search) {
      searchFilter.push(
        { email: { $regex: search, $options: 'i' } },
        { 'userDetails.mobile': { $regex: search, $options: 'i' } },
        { 'userDetails.pincode': { $regex: search, $options: 'i' } },
        { 'userDetails.address': { $regex: search, $options: 'i' } }
      );
    }

    const pipeline = [
      {
        $lookup: {
          from: 'userdetails',
          localField: '_id',
          foreignField: 'userId',
          as: 'userDetails',
        },
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      ...(searchFilter.length > 0 ? [{ $match: { $or: searchFilter } }] : []), // Apply search filter if exists
      {
        $project: {
          _id: 0,
          email: 1,
          'userDetails.mobile': 1,
          'userDetails.pincode': 1,
          'userDetails.address': 1,
        },
      },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
    ];

    const allUsers = await helperFunction(User, 'aggregate', { pipeline });

    const totalUsersCount = await helperFunction(User, 'aggregate', {
      pipeline: [
        {
          $lookup: {
            from: 'userdetails',
            localField: '_id',
            foreignField: 'userId',
            as: 'userDetails',
          },
        },
        { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
        ...(searchFilter.length > 0 ? [{ $match: { $or: searchFilter } }] : []),
        { $count: 'total' },
      ],
    });

    res.status(200).json({
      message: 'All users retrieved successfully',
      totalUsers: totalUsersCount.length ? totalUsersCount[0].total : 0,
      currentPage: Number(page),
      totalPages: Math.ceil((totalUsersCount.length ? totalUsersCount[0].total : 0) / Number(limit)),
      users: allUsers,
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getUserDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ message: 'User ID is missing' });
      return;
    }

    const userDetails = await helperFunction(UserDetails, 'find', { userId });

    if (!userDetails || userDetails.length === 0) {
      res.status(404).json({ message: 'User details not found' });
      return;
    }

    res.status(200).json({
      message: 'User details retrieved successfully',
      userDetails,
    });
  } catch (error) {
    console.error('Error in getUserDetails:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserDetails = async (req: Request, res: Response): Promise<void> => {
  const { mobile, pincode, address } = req.body;
  const userId = req.params.userId;

  try {
    if (!mobile && !pincode && !address) {
      res.status(400).json({ message: 'At least one field is required to update' });
      return;
    }

    const updateResult = await helperFunction(UserDetails, 'updateOne', {
      filter: { userId },
      update: { $set: { mobile, pincode, address } },
    });

    if (updateResult.matchedCount === 0) {
      res.status(404).json({ message: 'User details not found' });
      return;
    }

    res.status(200).json({ message: 'User details updated successfully' });
  } catch (error) {
    console.error('Error in updateUserDetails:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(400).json({ message: 'User ID is missing' });
      return;
    }

    const user = await helperFunction(User, 'findById', { _id: userId });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await helperFunction(UserDetails, 'deleteOne', { userId });
    await helperFunction(User, 'deleteOne', { _id: userId });

    res.status(200).json({ message: 'User account and details deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

