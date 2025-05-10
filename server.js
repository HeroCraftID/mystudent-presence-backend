import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js'
import analyticsRoutes from './routes/analytics.routes.js';
import presenceRoutes from './routes/presence.routes.js';
import "./controller/presence.controller.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_GLOBAL_URI = process.env.MONGO_GLOBAL_URI || 'mongodb://localhost:27017/mydatabase';

//routing
const origin = ['http://localhost:3000', 'http://localhost:3001'] // ⬅️ frontend origin

express.json();
app.use(express.json());
app.use(cors({
    origin: origin, // ⬅️ frontend origin
    credentials: true, // ⬅️ allow cookies / Authorization headers
  }));

//for debugging purpose [PLEASE DELETE IN PRODUCTION]
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });

app.use('/v1/user',userRoutes);
app.use('/v1/analytics',analyticsRoutes);
app.use('/v1/presence',presenceRoutes);
app.use('/v1/admin',adminRoutes);

//connect to mongodb
try{
    mongoose.connect(process.env.MONGO_GLOBAL_URI)
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}catch(err){
    console.log("error connecting to mongoDB" + err)
}
