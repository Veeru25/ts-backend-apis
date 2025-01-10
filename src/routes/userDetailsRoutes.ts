import express, { Router } from 'express';
import {
  authenticate,
  getUserDetails,
  updateUserDetails,
  deleteUser,
  isAdmin,
  getAllUsers,
} from '../controllers/userDetailsController';

const router: Router = express.Router();

router.get('/user/details', authenticate, getUserDetails);

router.get('/all-user-details', authenticate, isAdmin, getAllUsers);

router.put('/user/update/:userId', authenticate, isAdmin, updateUserDetails);

router.delete('/user/delete', authenticate, isAdmin, deleteUser);

export default router;
