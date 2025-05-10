import adminModel from "../models/admin.model.js";

export const getAdminData = async (id) => {
  if (!id) return null;
  const admin = await adminModel.findById(id).select("-password");
  return admin || null;
};
