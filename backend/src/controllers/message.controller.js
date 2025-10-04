import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketIds, io } from "../lib/socket.js";


export const getAllContacts = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: {$ne: loggedInUserId}}).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getAllContacts:", error);
        res.status(500).json({message:"Server error"});
    }
};

export const getMessagesByUserId = async (req, res) => {
    try {
        const myId = req.user._id;
        const {id:userToChatId} = req.params;

        const message = await Message.find({
            $or: [
                {senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId},
            ],
        });

        res.status(200).json(message);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({error:"Internal server error"});
    }
};

export const sendMessage = async (req, res) =>{
    try {
        const {text, image} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        if(!text && !image){
            return res.status(400).json({message: "Text or image is required."});
        }
        if(senderId.equals(receiverId)){
            return res.status(400).json({message: "Canonot message to yourself"});
        }

        const receiverExists = await User.exists({_id: receiverId});
        if(!receiverExists){
            return res.status(404).json({message: "Receiver not found."});
        }

        let imageUrl;
        if(image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        const receiverSocketIds = getReceiverSocketIds(receiverId);
        if (receiverSocketIds.length > 0) {
            receiverSocketIds.forEach(socketId => {
                io.to(socketId).emit("newMessage", newMessage);
            });
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};

export const getChatPartners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const sentToIds = await Message.distinct("receiverId", { senderId: loggedInUserId });

        const receivedFromIds = await Message.distinct("senderId", { receiverId: loggedInUserId });

        const chatPartnerIds = [...new Set([...sentToIds, ...receivedFromIds].map(id => id.toString()))];

        const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

        res.status(200).json(chatPartners);
    } catch (error) {
        console.log("Error in getChatPartners: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};