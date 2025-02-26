const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "department_head", "teacher", "printing_service"],
      required: true,
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" }, // Facultatif pour admin/printing_service
  },
  { timestamps: true } // Ajoute automatiquement "createdAt" et "updatedAt" au document.
);

module.exports = mongoose.model("User", userSchema);
