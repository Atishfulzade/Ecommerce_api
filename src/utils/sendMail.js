import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail", // You can also use other services like Outlook, Yahoo, etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

// Function to send an OTP email
export const sendOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: email, // List of receivers
      subject: "Your OTP Code", // Subject line
      text: `Your OTP is: ${otp}`, // Plain text body
    };

    // Send mail with defined transport object
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send email: ${error.message}`);
  }
};
