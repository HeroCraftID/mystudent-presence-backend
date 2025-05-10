import { getAllUsers, signUp } from '../controller/user.controller.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { requireAdminLogin } from '../middleware/requireAdminLogin.js';


dotenv.config();
const router = express.Router();

router.post('/signup', requireAdminLogin,signUp)
router.get('/get-all-users', requireAdminLogin, getAllUsers)

export default router;