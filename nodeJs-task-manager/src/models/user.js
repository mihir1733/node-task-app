const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Task = require("../models/task")

/**
 * Defines the schema for the User model.
 * @type {mongoose.Schema}
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be positive")
        }
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid!")
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password cannot contain 'password'")
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      // eslint-disable-next-line no-undef
      type: Buffer,
    },
  },
  {
    timestamps: true,
  },
)

/**
 * Virtual property to define the relationship between User and Task models.
 */
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
})

/**
 * Method to remove sensitive information from user object before sending it as JSON.
 * @function
 */
userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar
  return userObject
}

/**
 * Method to generate an authentication token for the user.
 * @function
 * @async
 * @returns {string} Authentication token.
 */
userSchema.methods.generateAuthToken = async function () {
  const user = this
  // eslint-disable-next-line no-undef
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
  user.tokens = user.tokens.concat({ token })
  await user.save()
  return token
}

/**
 * Static method to find a user by email and password.
 * @function
 * @async
 * @param {string} email - The email address of the user.
 * @param {string} password - The user's password.
 * @throws {Error} If no user is found or the password does not match.
 * @returns {User} The user object if found.
 */
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new Error("Unable to login!")
  }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error("Unable to login!")
  }
  return user
}

/**
 * Middleware to hash the user's password before saving it to the database.
 * @function
 * @async
 * @param {function} next - Next middleware function.
 */
userSchema.pre("save", async function (next) {
  const user = this
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

/**
 * Post middleware to delete tasks associated with a user when the user is deleted.
 * @function
 * @async
 * @param {User} user - The user being deleted.
 */
userSchema.post("findOneAndDelete", async function (user) {
  await Task.deleteMany({ owner: user._id })
})

/**
 * The Mongoose model for the User schema.
 * @type {mongoose.Model<User>}
 */
const User = mongoose.model("User", userSchema)

module.exports = User
