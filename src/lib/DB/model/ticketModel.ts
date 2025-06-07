import mongoose from "mongoose";


// _id will added at server
export const ticketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        required: true,
    },
    response: {
        default: "",
        type: String,
    },
    status: {
        default: "در انتظار بررسی",
        type: String,
    },
    title: {
        type: String,
        required: true,
        maxLength: 100,
    },
    txt: {
        type: String,
        required: true,
        maxLength: 500,
    },
    createdAt: {
        type: String,
    },
    updatedAt: {
        type: String,
    }
}, { timestamps: true })

const ticketModel = mongoose.models.tickets || mongoose.model("tickets", ticketSchema);

export default ticketModel;