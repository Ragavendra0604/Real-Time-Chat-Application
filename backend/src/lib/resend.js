import {ENV} from "./env.js";
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
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