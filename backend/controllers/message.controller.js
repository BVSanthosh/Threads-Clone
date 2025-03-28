import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import  { getRecipientSocketId } from "../socket/socket.js";
import {v2 as cloudinary} from "cloudinary";

export const sendMessage = async (req, res) => {
    const { recipientId, message } = req.body;
    let { img } = req.body;
    const senderId = req.user._id;

    try {
        let conversation = await Conversation.findOne({participants: {$all: [senderId, recipientId]}})

        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, recipientId],
                lastMessage: {
                    text: message,
                    sender: senderId,
                } 
            }); 

            await conversation.save();
        }

        if (img) {
            const uploadedImg = await cloudinary.uploader.upload(img);
            img = uploadedImg.secure_url;
        }

        const newMessage = new Message({
            conversationId: conversation._id,
            sender: senderId,
            text: message,
            img: img || "",
        });

        await Promise.all([
            newMessage.save(),
            conversation.updateOne({
                lastMessage: {
                    text: message, 
                    sender: senderId,
                }
            })
        ]);

        const recipientSocketId = getRecipientSocketId(recipientId);

        if (recipientSocketId) {
            io.to(recipientSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message })
        console.error(`Error in sendMessage: ${error.message}`);
    }
}

export const getMessages = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    try {
        const conversation = await Conversation.findOne({
            participants: { $all : [userId, id] }
        });

        if (!conversation) {
            res.status(404).json({ error: "Conversation not found!" });
        }

        const messages = await Message.find({
            conversationId: conversation._id
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message })
        console.error(`Error in getMessages: ${error.message}`);
    }
}

export const getConversations = async (req, res) => {
    const userId = req.user._id;

    try {
        const conversations = await Conversation.find({ 
            participants: userId 
        }).populate({
            path: "participants",
            select: "username profilePic",
        });

        conversations.forEach(conversation => {
            conversation.participants = conversation.participants.filter(
                participant => participant._id.toString() !== userId.toString()
            );
        });

        res.status(200).json(conversations); 
    } catch (error) {
        res.status(500).json({ error: error.message })
        console.error(`Error in getConversations: ${error.message}`);
    }
}