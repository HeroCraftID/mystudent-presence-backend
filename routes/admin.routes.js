import { createAdminAccount, loginAdmin, getAdminProfile } from '../controller/admin.controller.js';
import { requireAdminLogin } from '../middleware/requireAdminLogin.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { requireSU_Login } from '../middleware/requireSU_Login.js';


dotenv.config();
const router = express.Router();

router.post('/user/create', requireSU_Login, createAdminAccount)
router.post("/user/login", loginAdmin);
router.get("/user/me", requireAdminLogin, getAdminProfile);

export default router;