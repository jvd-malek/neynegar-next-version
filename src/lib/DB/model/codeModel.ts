import mongoose from "mongoose";

// _id will added at server
// this model doesnt need virtual relationship
export const codeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    exTime: {
        type: Number,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        required: true,
    }
}, { timestamps: true })

const codeModel = mongoose.models.codes || mongoose.model("codes", codeSchema);

export default codeModel;