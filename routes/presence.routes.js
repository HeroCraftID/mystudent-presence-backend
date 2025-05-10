import express from "express";
import mongoose from "mongoose";   
import cors from "cors";
import dotenv from "dotenv";
import { getAllTodayPresence, setPresence, setApproval, acquireRecap, acquireRecapAll } from "../controller/presence.controller.js";
import { requireAdminLogin } from "../middleware/requireAdminLogin.js";


const router = express.Router();
dotenv.config();

router.get("/get-today-presence", requireAdminLogin, getAllTodayPresence);
router.get("/get-presence-report-single", requireAdminLogin, acquireRecap);
router.get("/get-presence-report-all", requireAdminLogin, acquireRecapAll);
router.post("/set-presence", setPresence);
router.post("/set-approval", requireAdminLogin, setApproval);

export default router;