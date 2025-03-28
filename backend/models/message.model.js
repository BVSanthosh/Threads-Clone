import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "conversation",
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    text: {
        type: String,
    },
    seen: {
        type: Boolean,
        default: false,
    },
    img: {
        type: String,
        default: "",
    }
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;