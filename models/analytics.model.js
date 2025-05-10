import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const conn = mongoose.createConnection(process.env.MONGO_ANALYTICS_URI)


// Pastikan koneksi berhasil sebelum membuat model
conn.on('error', console.error.bind(console, 'MongoDB connection error:'));
conn.once('open', () => {
    console.log('MongoDB connected (user)');
});

const analyticsSchema = new mongoose.Schema({
    Hadir: { type: Number, default:0 },
    Sakit: { type: Number, default:0 },
    Izin: {type: Number, default:0 },
    Alfa: { type: Number, default:0 },
    Terlambat: { type: Number, default:0 },

}, { timestamps: true });

// ⛔ JANGAN pakai mongoose.model()
// ✅ GUNAKAN connection.model()
const analyticsModel = conn.model('dashboard', analyticsSchema);

export default analyticsModel;
