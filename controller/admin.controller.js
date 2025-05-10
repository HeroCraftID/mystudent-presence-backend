import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import adminModel from "../models/admin.model.js";
import { generateToken } from "../config/jwt.js";
import { getAdminData } from "../utils/admin.utils.js";

const app = express();
dotenv.config();

// POST /api/admin/login
export const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password)
            return res.status(400).json({ message: "Username and password required" });

        const admin = await adminModel.findOne({ username });
        if (!admin)
            return res.status(404).json({ message: "Admin not found" });

        const isMatch = await admin.comparePassword(password);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid credentials" });

        const token = generateToken({ id: admin._id, role: admin.role });

        res.status(200).json({
            message: "Login successful",
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


export const createAdminAccount = async (req, res) => {
    try{
        const SU = await getAdminData(req.superadmin.id);
        if (!SU) return res.status(403).json({ message: "Forbidden" });
        if(SU.role !=='superadmin' && SU.role !=='root') return res.status(401).json({ message: "Unauthorized" });

        const {NIP, username, name, password, gender, address} = req.body;
        switch (true) {
            case !NIP:
                return res.status(400).json({ message: "NIP is required" });
            case !username:
                return res.status(400).json({ message: "username is required" });
            case !name:
                return res.status(400).json({ message: "Name is required" });
            case !password:
                return res.status(400).json({ message: "Password is required" });
            case !gender:
                return res.status(400).json({ message: "gender number is required" });
            case !address:
                return res.status(400).json({ message: "address number is required" });
        }
        if(await adminModel.findOne({NIP})){
            return res.status(400).json({ message: "NIS already exists" });
        }
        const newUser = await adminModel.create({
            NIP,
            username,
            name,
            password,
            gender,
            address,
        });
        return res.status(201).json({
            message: "OK",
            statusCode: 201,
            data:{
                newUser
            }
        })
    }catch (error) {
        console.error("Error in signUp:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// GET /api/admin/me
export const getAdminProfile = async (req, res) => {
    try {
        const admin = await adminModel.findById(req.admin.id).select("-password");
        if (!admin) return res.status(404).json({ message: "Admin not found" });
        res.json(admin);
    } catch (err) {
        res.status(500).json({ message: "Error fetching admin profile" });
    }
};
export const getAdminProfileVerify = async (req, res) => {
    try {
      const admin = await getAdminData(req.id);
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }
      res.json(admin);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

