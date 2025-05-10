import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import userModel from "../models/user.model.js";
import { getAdminProfileVerify } from "./admin.controller.js";
import { getAdminData } from "../utils/admin.utils.js";

const app = express();
dotenv.config();

export const signUp = async (req, res) => {
    try{
        const admin = await getAdminData(req.admin.id);
        if (!admin) return res.status(403).json({ message: "Forbidden" });
        if(admin.role !=='admin' && admin.role !=='superadmin' && admin.role !=='root') return res.status(401).json({ message: "Unauthorized" })
        const {NIS, name, Class, presenceNum, gender, address} = req.body;
        switch (true) {
            case !NIS:
                return res.status(400).json({ message: "NIS is required" });
            case !name:
                return res.status(400).json({ message: "Name is required" });
            case !Class:
                return res.status(400).json({ message: "Class is required" });
            case !presenceNum:
                return res.status(400).json({ message: "Presence number is required" });
        }
        if(await userModel.findOne({NIS})){
            return res.status(400).json({ message: "NIS already exists" });
        }
        const newUser = await userModel.create({
            NIS,
            name,
            Class,
            presenceNum,
            gender,
            address,
        });
        return res.status(201).json({
            message: "OK",
            statusCode: 201,
            data:{
                newUser
            },
            admin:{
                admin
            }
        })
    }catch (error) {
        console.error("Error in signUp:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllUsers = async (req, res) => {
    try {
      const admin = await getAdminData(req.admin.id);
      if (!admin) return res.status(403).json({ message: "Forbidden" });
      if (!["admin", "superadmin", "root"].includes(admin.role))
    return res.status(401).json({ message: "Unauthorized" });
  
      const users = await userModel.find(); // atau logic lain
      res.json({
        message: "OK",
        statusCode: 200,
        data: {
          users,
        },
        admin: {
            admin
        }
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };