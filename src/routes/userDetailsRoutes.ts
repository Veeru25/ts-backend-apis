// Swagger UI

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for user management
 */

/**
 * @swagger
 * /api/user/details:
 *   get:
 *     summary: Get authenticated user details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userDetails:
 *                   type: object
 *       401:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/all-user-details:
 *   get:
 *     summary: Get all user details (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email
 *       - in: query
 *         name: mobile
 *         schema:
 *           type: string
 *         description: Filter by mobile number
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 totalUsers:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         description: Forbidden access
 */

/**
 * @swagger
 * /api/user/update/{userId}:
 *   put:
 *     summary: Update user details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *               pincode:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated user details
 *       403:
 *         description: Forbidden access
 */

/**
 * @swagger
 * /api/user/delete:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully deleted user
 *       403:
 *         description: Forbidden access
 */

import express, { Router } from 'express';
import {
  authenticate,
  getUserDetails,
  updateUserDetails,
  deleteUser,
  isAdmin,
  getAllUsers,
  updateUser,
} from '../controllers/userDetailsController';

const router: Router = express.Router();

router.get('/user/details', authenticate, getUserDetails);

router.get('/all-user-details', authenticate, isAdmin, getAllUsers);

router.put('/user/update/:userId', authenticate, updateUser, updateUserDetails);

router.delete('/user/delete', authenticate, isAdmin, deleteUser);

export default router;
