import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import socketAuthMiddleware from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [ENV.CLIENT_URL],
        credentials: true,
    }
});

io.use(socketAuthMiddleware);

const userSocketMap = {};

export function getReceiverSocketIds(userId) {
    return userSocketMap[userId] || [];
}

io.on("connection", (socket) => {
    console.log("A user connected", socket.user.fullName);
    const userId = socket.userId;

    if(!userSocketMap[userId]){
        userSocketMap[userId] = [];
    }

    userSocketMap[userId].push(socket.id);

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.user.fullName);
        userSocketMap[userId] = userSocketMap[userId]?.filter(id => id !== socket.id);        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        
        if(userSocketMap[userId]?.length === 0){
            delete userSocketMap[userId];
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export {io, app, server};