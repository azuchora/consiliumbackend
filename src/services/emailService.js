const nodemailer = require('nodemailer');

const sendResetEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: 'icloud',
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        text: `Reset your password: ${resetUrl}`,
        html: `<a href="${resetUrl}">Reset your password</a>`
    });
};

module.exports = { sendResetEmail };