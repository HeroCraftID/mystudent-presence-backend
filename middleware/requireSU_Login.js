import jwt from 'jsonwebtoken';

export const requireSU_Login = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
        if (!token) return res.status(401).json({ message: "No token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!["superadmin", "root"].includes(decoded.role))
            return res.status(403).json({ message: "Access denied" });

        req.superadmin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
