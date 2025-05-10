import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import moment from 'moment-timezone';
import { getAdminData } from "../utils/admin.utils.js";

import analyticsModel from "../models/analytics.model.js";

const app = express();
dotenv.config();



export const getAnalyticsInNumber = async (req,res) => {
    try{
        const admin = await getAdminData(req.admin.id);
        if (!admin) return res.status(403).json({ message: "Forbidden" });
        if (!["admin", "superadmin", "root"].includes(admin.role))
    return res.status(401).json({ message: "Unauthorized" });

        const analytics = await analyticsModel.find({});
        return res.status(200).json({
            message: "OK",
            statusCode: 200, 
            data:{
                analytics
            }
        });
    }catch( error ){
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
export const getAnalyticsInPercentage = async (req,res) => {
    try{
        const admin = await getAdminData(req.admin.id);
        if (!admin) return res.status(403).json({ message: "Forbidden" });
        if (!["admin", "superadmin", "root"].includes(admin.role))
    return res.status(401).json({ message: "Unauthorized" });

        const analytics = await analyticsModel.find({});
        if (!analytics[0]) {
            return res.status(404).json({
                message: "Data analytics not found",
                statusCode: 404,
                data: null
            });
        }
        
        const { Hadir, Sakit, Izin, Alfa, Terlambat } = analytics[0];
        const Total = Hadir + Sakit + Izin + Alfa + Terlambat;
        
        const presentase = {
            Hadir: Number(((Hadir / Total) * 100).toFixed(0)),
            Sakit: Number(((Sakit / Total) * 100).toFixed(0)),
            Izin: Number(((Izin / Total) * 100).toFixed(0)),
            Alfa: Number(((Alfa / Total) * 100).toFixed(0)),
            Terlambat: Number(((Terlambat / Total) * 100).toFixed(0)),
        };
        
        return res.status(200).json({
            message: "OK",
            statusCode: 200,
            data: presentase
        });
    }catch( error ){
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
export const setAnalyticsNumber = async(type, number) => {
    try{
        switch (type){
            case "Hadir":
                await analyticsModel.findOneAndUpdate({}, { $inc: { Hadir: number } });
                break;
            case "Sakit":
                await analyticsModel.findOneAndUpdate({}, { $inc: { Sakit: number } });
                break;
            case "Alpa":
                await analyticsModel.findOneAndUpdate({}, { $inc: { Alpa: number } });
                break;
            case "Terlambat":
                await analyticsModel.findOneAndUpdate({}, { $inc: { Terlambat: number } });
                break;
        }
    }catch (error){
        console.error("Error in setAnalyticsNumber:", error);
        res.status(500).json({ message: "Internal server error" }); 
    }
}