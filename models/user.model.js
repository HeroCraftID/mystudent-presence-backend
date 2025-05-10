import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const conn = mongoose.createConnection(process.env.MONGO_USERDB_URI)


// Pastikan koneksi berhasil sebelum membuat model
conn.on('error', console.error.bind(console, 'MongoDB connection error:'));
conn.once('open', () => {
    console.log('MongoDB connected (user)');
});

const userSchema = new mongoose.Schema({
    NIS: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    Class: { type: String, required: true },
    presenceNum: { type: Number, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    PresenceType: {
        type: String,
        enum: ['Hadir', 'Sakit', 'Izin', 'Alfa', 'Belum Absen', "Terlambat"],
        default: 'Belum Absen'
    },
    PresenceTime: { type: Date, default: null },
    PresenceStatus: {
        type: String,
        enum: ['Accepted', 'Rejected', 'Pending'],
        default: 'Pending'
    },
    isPresence: { type: Boolean, default: false },
    PresenceRecap:{
        Hadir: { type: Number, default: 0 },
        Sakit: { type: Number, default: 0 },
        Izin: { type: Number, default: 0 },
        Alfa: { type: Number, default: 0 },
        Terlambat: { type: Number, default: 0 },
        Total: { type: Number, default: 0 },
        Percentage: { type: Number, default: 0 }
    }
}, { timestamps: true });

// ⛔ JANGAN pakai mongoose.model()
// ✅ GUNAKAN connection.model()
const userModel = conn.model('user_siswa', userSchema);

export default userModel;
