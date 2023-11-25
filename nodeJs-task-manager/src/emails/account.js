const nodemailer = require("nodemailer")

/**
 * Creates a Nodemailer transporter for sending emails.
 * @type {import("nodemailer").Transporter}
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    // eslint-disable-next-line no-undef
    user: process.env.EMAIL,
    // eslint-disable-next-line no-undef
    pass: process.env.PASSWORD,
  },
})

/**
 * Sends a welcome email to a user.
 * @async
 * @function
 * @param {string} email - The recipient's email address.
 * @param {string} name - The recipient's name.
 * @throws {Error} If there's an error sending the email.
 */
async function sendWelcomeMail(email, name) {
  try {
    const info = await transporter.sendMail({
      from: "From task-manager-app",
      to: email,
      subject: "Thanks for joining in..",
      text: `Welcome to the task-manager app, ${name}! Let us know how you get along with the app.`,
    })

    console.log("Message Sent: %s", info.messageId)
  } catch (error) {
    console.log(error)
  }
}

/**
 * Sends an account cancellation email to a user.
 * @async
 * @function
 * @param {string} email - The recipient's email address.
 * @param {string} name - The recipient's name.
 * @throws {Error} If there's an error sending the email.
 */
async function sendCancellationMail(email, name) {
  try {
    const info = await transporter.sendMail({
      from: "From task-manager-app",
      to: email,
      subject: "Account Removal",
      text: `Hey ${name}! Let us know why you deleted your account.`,
    })

    console.log("Message Sent: %s", info.messageId)
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  sendWelcomeMail,
  sendCancellationMail,
}
