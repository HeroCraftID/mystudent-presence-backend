import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import moment from 'moment-timezone';
import { getAdminData } from "../utils/admin.utils.js";
import cron from 'node-cron';

import  userModel  from "../models/user.model.js";
import { setAnalyticsNumber } from "./analytics.controller.js";

cron.schedule('28 16 * * *', async () => {
    try {
      console.log('Resetting presence data at 13:42 Jakarta time...');
      
      // Lakukan reset pada data Presence
      await userModel.updateMany(
        { 'PresenceTime': { $ne: null } },  // Pastikan hanya yang sudah absen yang direset
        {
          $set: {
            PresenceType: 'Belum Absen',
            PresenceTime: null,
            PresenceStatus: 'Pending',
            isPresence: false
          }
        }
      );
  
      console.log('Presence data reset complete!');
    } catch (error) {
      console.error('Error resetting presence data:', error);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Jakarta' // Pastikan timezone Jakarta
  });


export const getAllTodayPresence = async (req, res) => {
    try {
        const admin = await getAdminData(req.admin.id);
        if (!admin) return res.status(403).json({ message: "Forbidden" });
        if (!["admin", "superadmin", "root"].includes(admin.role))
    return res.status(401).json({ message: "Unauthorized" });
        // Get the current date in Jakarta timezone
        const today = moment.tz('Asia/Jakarta');
        
        // Set the start of the day (midnight) and end of the day (11:59 PM) in Jakarta
        const startOfDay = today.clone().startOf('day');
        const endOfDay = today.clone().endOf('day');

        console.log('Start of day:', startOfDay.format());
        console.log('End of day:', endOfDay.format());

        // Find all users who have a `PresenceTime` between the start and end of today in Jakarta time
        const data = await userModel.find({
            PresenceTime: {
                $gte: startOfDay.toDate(),
                $lte: endOfDay.toDate()
            }
        });

        // Map through the data and format `PresenceTime` in Jakarta time
        const formattedData = data.map(user => ({
            ...user.toObject(),
            PresenceTime: moment(user.PresenceTime).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss') // Formatting to Jakarta time
        }));

        return res.status(200).json({
            message: "OK",
            statusCode: 200,
            data: formattedData,
            admin: {
                admin
            }


        });
    } catch (error) {
        console.error("Error in getAllTodayPresence:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const setPresence = async (req, res) => {
    try {
      const { NIS } = req.body;
      if (!NIS) {
        return res.status(400).json({ message: "NIS is required" });
      }
  
      const jakartaTime = moment.tz('Asia/Jakarta');
      const presenceTime = jakartaTime.format('YYYY-MM-DD HH:mm:ss');
      const currentHour = jakartaTime.hour();
      const currentMinute = jakartaTime.minute();
  
      let presenceType = '';
      if ((currentHour === 5 && currentMinute >= 30) || (currentHour >= 6 && currentHour < 24)) {
        presenceType = 'Hadir';
      } else if (currentHour >= 24 && currentMinute >= 30) {
        presenceType = 'Terlambat';
      } else {
        presenceType = 'Terlambat'; // fallback
      }
  
      const checkUser = await userModel.findOne({ NIS });
      if (!checkUser) {
        return res.status(404).json({
          message: "Not found",
          statusCode: 404,
          data: { NIS }
        });
      }
      if(checkUser.isPresence === true) {
        return res.status(404).json({
          message: "Bad Request",
          statusCode: 400,
          data: {
            error: "Student already attended!"
          }
        });
      }
      
  
      const updatedUser = await userModel.findOneAndUpdate(
        { NIS },
        {
          PresenceTime: jakartaTime.toDate(),
          PresenceType: presenceType,
          isPresence: true
        },
        { new: true }
      );
  
      if (!updatedUser) {
        throw new Error('User not found');
      }
  
       // ✅ panggil di sini
      
      return res.status(200).json({
        message: 'OK',
        statusCode: 200,
        data: { user: updatedUser }
      });
    } catch (error) {
      console.error('Error setting presence:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  const setPresenceRecap = async (NIS, presenceType) => {
    try {
      const user = await userModel.findOne({ NIS });
      if (!user) return null;
  
      if (presenceType && user.PresenceRecap.hasOwnProperty(presenceType)) {
        user.PresenceRecap[presenceType] += 1;
      }
  
      // Hitung ulang total
      user.PresenceRecap.Total =
        user.PresenceRecap.Hadir +
        user.PresenceRecap.Sakit +
        user.PresenceRecap.Izin +
        user.PresenceRecap.Alfa +
        user.PresenceRecap.Terlambat;

    //hiutng ulang persentase
    user.PresenceRecap.Percentage = (
        (user.PresenceRecap.Hadir / user.PresenceRecap.Total) * 100)
        .toFixed(2)
  
      await user.save();
    } catch (err) {
      console.error("Error updating PresenceRecap:", err);
    }
  };
  

export const acquireRecap = async (req, res) => {
    try{
        const {NIS} = req.query;
        const admin = await getAdminData(req.admin.id);
        console.log("Admin Role: ", admin.role);
        if (!admin) return res.status(403).json({ message: "Forbidden" });
        if (!["admin", "superadmin", "root"].includes(admin.role))
    return res.status(401).json({ message: "Unauthorized" });
        const user = await userModel.findOne({ NIS });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            message: "OK",
            statusCode: 200,
            data: {
                NIS: user.NIS,
                Name: user.name,
                Class: user.Class,
                PreNum: user.presenceNum,
                presenceRecap: user.PresenceRecap
            },
            admin: {
                admin
            }
        });
    }catch (err){
        console.error("Error acquiring Recap:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}
export const acquireRecapAll = async (req, res) => {
    try {
        const admin = await getAdminData(req.admin.id);
        if (!admin) return res.status(403).json({ message: "Forbidden" });
        if (!["admin", "superadmin", "root"].includes(admin.role))
    return res.status(401).json({ message: "Unauthorized" });

        const users = await userModel.find({}, {
            _id:1,
            NIS: 1,
            name: 1,
            Class: 1,
            presenceNum: 1,
            PresenceRecap: 1
        });

        const formattedUsers = users.map(user => ({
            NIS: user.NIS,
            name: user.name,
            Class: user.Class,
            presenceNum: user.presenceNum,
            PresenceRecap: user.PresenceRecap
        }));

        return res.status(200).json({
            message: "OK",
            statusCode: 200,
            data: formattedUsers,
            admin: { admin }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const setApproval = async (req, res) => {
    try {
        const { NIS, isAccept, category } = req.body;
        const isAccepted = isAccept === true ? "Accepted" : "Rejected";
        const final = isAccept === true ? category : "Alfa"
        const admin = await getAdminData(req.admin.id);
        if (!admin) return res.status(403).json({ message: "Forbidden" });
        if (!["admin", "superadmin", "root"].includes(admin.role))
    return res.status(401).json({ message: "Unauthorized" });
        const user = await userModel.findOneAndUpdate({NIS}, {
            PresenceStatus: isAccepted,
            PresenceType: final
        })
        const recap = await userModel.findOne({NIS})
        const recapData = recap.PresenceType
        console.log(recap)
        await setPresenceRecap(NIS, recapData);
        if(isAccept){
            await setAnalyticsNumber(recapData, 1);
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            message: "OK",
            statusCode: 200,
            data: user,
            admin:{
                admin
            }
        });
    } catch (error) {
        console.error("Error in setApproval:", error);
        res.status(500).json({ 
            message: "Internal server error",
            statusCode: 500,
            error: {
                error
            }
         });
    }
}