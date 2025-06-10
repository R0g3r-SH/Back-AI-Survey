import express from 'express';
import { createUser, getUsers } from '../controllers/userController.js';

const router = express.Router();

// Route to create a new user
router.post('/', createUser);

// Route to get all users
router.get('/', getUsers);

export default router;
