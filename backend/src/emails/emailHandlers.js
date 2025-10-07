import { transporter, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "../emails/emailTemplates.js"


export const sendWelcomeEmail = async (email, name, clientURL) => {
   const mailOptions = {
        from: `${sender.name} <${sender.email}>`,
        to: email,
        subject: "Welcome to NodeChat!!",
        html: createWelcomeEmailTemplate(name, clientURL),
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Welcome email sent: ", info.response);
    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw new Error("Failed to send welcome email");
    }
};

