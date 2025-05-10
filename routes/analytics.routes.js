import express from "express";
import mongoose from "mongoose";   
import cors from "cors";
import dotenv from "dotenv";
import { getAnalyticsInNumber, getAnalyticsInPercentage } from "../controller/analytics.controller.js";
import { requireAdminLogin } from "../middleware/requireAdminLogin.js";


const router = express.Router();
dotenv.config();

router.get("/get-analytics-number", requireAdminLogin, getAnalyticsInNumber);
router.get("/get-analytics-percentage", requireAdminLogin, getAnalyticsInPercentage);
export default router;