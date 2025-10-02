import { 
    getAllContacts, 
    getMessagesByUserId, 
    sendMessage , 
    getChatPartners
} from "../controllers/message.controller.js";
import {protectRoute} from "../middleware/auth.middleware.js";
import {arcjetProtection} from "../middleware/arcjet.middleware.js";
import express from "express";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);

// router.get("/receive", (req, res) => {
//     res.send("Receive message endpoint");
// });

export default router;