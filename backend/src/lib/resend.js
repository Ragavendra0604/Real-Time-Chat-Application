import {ENV} from "./env.js";
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    service: "gmail",
    auth: {
        user: ENV.EMAIL_FROM,
        pass: ENV.EMAIL_PASSWORD, 
    }
});

export const sender = {
  name: "NodeChat",
  email: process.env.EMAIL_FROM,
};
