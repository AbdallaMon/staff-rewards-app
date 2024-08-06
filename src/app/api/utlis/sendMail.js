import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export const sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from: `"emsatstaff" <${process.env.EMAIL_USERNAME}>`,
        to,
        subject,
        html,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
    }
};