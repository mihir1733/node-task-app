const mongoose = require("mongoose")

/**
 * Defines the schema for the Task model.
 * @type {mongoose.Schema}
 */
const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

/**
 * The Mongoose model for the Task schema.
 * @type {mongoose.Model<Task>}
 */
const Task = mongoose.model("Task", taskSchema)

module.exports = Task
