import express from 'express';
import { deleteUserActivities, getUserActivities, recordUserActivity } from '../controllers/userActivity.controller';

const router = express.Router();

// POST /api/user-activity - Record a new user activity
router.post('/', recordUserActivity);

// GET /api/user-activity/:user_id - Get user activities for a specific user
router.get('/:user_id', getUserActivities);

// DELETE /api/user-activity/:user_id - Delete user activities for a specific user
router.delete('/:user_id', deleteUserActivities);

export default router; 