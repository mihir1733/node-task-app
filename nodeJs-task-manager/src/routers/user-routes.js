const express = require("express")
const multer = require("multer")
const sharp = require("sharp")
const User = require("../models/user")
const router = new express.Router()
const auth = require("../middleware/auth")
const { sendWelcomeMail, sendCancellationMail } = require("../emails/account")

/**
 * Create a new user.
 *
 * @name POST /users
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.post("/users", async (req, res) => {
  try {
    const user = new User(req.body)
    await user.save()
    sendWelcomeMail(user.email, user.name)
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (error) {
    res.status(400).send("Error: " + error)
  }
})

/**
 * Login a user.
 *
 * @name POST /users/login
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (error) {
    res.status(400).send("Error: " + error)
  }
})

/**
 * Logout a user.
 *
 * @name POST /users/logout
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()
    res.send()
  } catch (error) {
    res.status(500).send("Error: " + error)
  }
})

/**
 * Logout all sessions for a user.
 *
 * @name POST /users/logoutAll
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (error) {
    res.status(500).send("Error: " + error)
  }
})

/**
 * Get the user's own profile.
 *
 * @name GET /users/me
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user)
})

/**
 * Update the user's own profile.
 *
 * @name PATCH /users/me
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ["name", "age", "email", "password"]
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update),
  )
  if (!isValidUpdate) {
    return res.status(400).send("Error: Invalid updates")
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]))
    await req.user.save()
    res.send(req.user)
  } catch (error) {
    res.status(400).send("Error: " + error)
  }
})

/**
 * Delete the user's own profile.
 *
 * @name DELETE /users/me
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.delete("/users/me", auth, async (req, res) => {
  try {
    await User.findOneAndDelete(req.user)
    sendCancellationMail(req.user.email, req.user.name)
    res.send(req.user)
  } catch (error) {
    res.status(500).send("Error: " + error)
  }
})

/**
 * Configure multer for uploading user avatars.
 */
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return callback(
        new Error("Please select .jpg, .png, and .jpeg files only."),
      )
    }
    callback(undefined, true)
  },
})

/**
 * Upload a user's avatar.
 *
 * @name POST /users/me/avatar
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
  },
  (error, req, res) => {
    res.status(400).send(error.message)
  },
)

/**
 * Delete the user's avatar.
 *
 * @name DELETE /users/me/avatar
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

/**
 * Get a user's avatar by user ID.
 *
 * @name GET /users/:id/avatar
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
      throw new Error()
    }
    res.set("Content-Type", "image/png")
    res.send(user.avatar)
  } catch (error) {
    res.status(404).send(error)
  }
})

module.exports = router
