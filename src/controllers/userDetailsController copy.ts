import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import UserDetails from '../models/UserDetails';
import dotenv from 'dotenv';

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

export const getUserDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ message: 'User ID is missing' });
      return;
    }

    const userDetailsId = await UserDetails.findOne({ userId }).exec();
    if (!userDetailsId?.userId) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const userDetails = await UserDetails.aggregate([
      { $match: { userId: userDetailsId.userId } },
      {
        $project: {
          _id: 0,
          userId: 0,
          __v: 0,
        },
      },
    ]);

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

// export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const allUsers = await User.aggregate([
//       {
//         $lookup: {
//           from: 'userdetails',
//           localField: '_id',
//           foreignField: 'userId',
//           as: 'userDetails',
//         },
//       },
//       {
//         $unwind: {
//           path: '$userDetails',
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           email: 1,
//           'userDetails.mobile': 1,
//           'userDetails.pincode': 1,
//           'userDetails.address': 1,
//         },
//       },
//     ]);

//     if (!allUsers || allUsers.length === 0) {
//       res.status(404).json({ message: 'No users found' });
//       return;
//     }

//     res.status(200).json({
//       message: 'All users retrieved successfully',
//       users: allUsers,
//     });
//   } catch (error) {
//     console.error('Error in getAllUsers:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 3, email, mobile } = req.query;

    // Create a search filter
    const searchFilter: any = {};
    if (email) searchFilter.email = { $regex: email, $options: 'i' }; // Case-insensitive search
    if (mobile) searchFilter['userDetails.mobile'] = { $regex: mobile, $options: 'i' }; // Case-insensitive search

    const allUsers = await User.aggregate([
      {
        $lookup: {
          from: 'userdetails',
          localField: '_id',
          foreignField: 'userId',
          as: 'userDetails',
        },
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: searchFilter,
      },
      {
        $project: {
          _id: 0,
          email: 1,
          'userDetails.mobile': 1,
          'userDetails.pincode': 1,
          'userDetails.address': 1,
        },
      },
      {
        $skip: (Number(page) - 1) * Number(limit),
      },
      {
        $limit: Number(limit),
      },
    ]);

    if (!allUsers || allUsers.length === 0) {
      res.status(404).json({ message: 'No users found' });
      return;
    }

    // Get the total count of matching documents
    const totalUsers = await User.aggregate([
      {
        $lookup: {
          from: 'userdetails',
          localField: '_id',
          foreignField: 'userId',
          as: 'userDetails',
        },
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: searchFilter,
      },
      {
        $count: 'total',
      },
    ]);

    res.status(200).json({
      message: 'All users retrieved successfully',
      totalUsers: totalUsers.length > 0 ? totalUsers[0].total : 0,
      currentPage: Number(page),
      totalPages: Math.ceil((totalUsers.length > 0 ? totalUsers[0].total : 0) / Number(limit)),
      users: allUsers,
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
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

    let userDetails = await UserDetails.findOne({ userId }).exec();

    if (!userDetails) {
      res.status(404).json({ message: 'User details not found' });
      return;
    }

    if (mobile) userDetails.mobile = mobile;
    if (pincode) userDetails.pincode = pincode;
    if (address) userDetails.address = address;

    await userDetails.save();

    res.status(200).json({
      message: 'User details updated successfully',
      userDetails,
    });
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

    const user = await User.findById(userId).exec();
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await UserDetails.findOneAndDelete({ userId }).exec();
    await User.findByIdAndDelete(userId).exec();

    res.status(200).json({ message: 'User account and details deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
