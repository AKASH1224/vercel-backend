const mongoose = require("mongoose");

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true, // Username is required
      unique: true, // No duplicate usernames
      trim: true, // Removes extra spaces
      minlength: 3, // Must be at least 3 characters long
    },
    email: {
      type: String,
      required: true, // Email is required
      unique: true, // No duplicate emails
      trim: true, // Removes extra spaces
      lowercase: true, // Converts email to lowercase
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"], // Email validation
    },
    password: {
      type: String,
      required: true, // Password is required
      // Must be at least 6 characters long
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task", // Links to the Task model
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Add indexes for faster searches
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// Create and export the User model
const User = mongoose.model("User", userSchema);
module.exports = User;
