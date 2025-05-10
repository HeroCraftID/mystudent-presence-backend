import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // pastikan ini di-import
dotenv.config();

const conn = mongoose.createConnection(process.env.MONGO_USERDB_URI);

// Koneksi log
conn.on('error', console.error.bind(console, 'MongoDB connection error:'));
conn.once('open', () => {
    console.log('MongoDB connected (user)');
});

// Schema admin
const adminSchema = new mongoose.Schema({
    NIP: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["admin", "superadmin", "root"], default: "admin" },
    password: { type: String, required: true, select:false },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    profilepic: {
        type: String,
        default: "data:image/png;base64,iVBORw0K..." // potong untuk singkat
    }
}, { timestamps: true });

// 🔒 Enkripsi password sebelum disimpan
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// 🔐 Tambahkan metode untuk cek password
adminSchema.methods.comparePassword = function (inputPassword) {
    return bcrypt.compare(inputPassword, this.password);
};

// ✅ Baru buat model setelah semua hook & methods didefinisikan
const adminModel = conn.model('user_admin', adminSchema);

export default adminModel;
