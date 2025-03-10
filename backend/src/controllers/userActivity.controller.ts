import { Request, Response } from 'express';
import UserActivity from '../models/userActivity.model';

/**
 * Record a new user activity
 * @param req - Express request object
 * @param res - Express response object
 */
export const recordUserActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, action_type, action_details, device_info } = req.body;

    if (!user_id || !action_type || !action_details) {
      res.status(400).json({
        success: false, 
        message: 'Missing required fields: user_id, action_type, and action_details are required' 
      });
      return;
    }

    const newActivity = new UserActivity({
      user_id,
      action_type,
      action_details,
      device_info: device_info || {}
    });

    await newActivity.save();

    res.status(201).json({
      success: true,
      message: 'User activity recorded successfully',
      data: newActivity
    });
  } catch (error) {
    console.warn('Error recording user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record user activity',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get user activities for a specific user
 * @param req - Express request object
 * @param res - Express response object
 */
export const getUserActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id } = req.params;
    const { start_date, end_date, action_type, limit = 100, skip = 0 } = req.query;

    const query: any = { user_id };

    // Add date range filter if provided
    if (start_date || end_date) {
      query.timestamp = {};
      if (start_date) query.timestamp.$gte = new Date(start_date as string);
      if (end_date) query.timestamp.$lte = new Date(end_date as string);
    }

    // Add action type filter if provided
    if (action_type) {
      query.action_type = action_type;
    }

    const activities = await UserActivity.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await UserActivity.countDocuments(query);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip)
      }
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activities',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete user activities (for data privacy compliance)
 * @param req - Express request object
 * @param res - Express response object
 */
export const deleteUserActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id } = req.params;
    
    const result = await UserActivity.deleteMany({ user_id });
    
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} user activity records`,
      data: result
    });
  } catch (error) {
    console.error('Error deleting user activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user activities',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 