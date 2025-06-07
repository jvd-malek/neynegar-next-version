import mongoose from "mongoose";

// _id will added at server
// this model doesnt need virtual relationship
export const authorSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 10,
    },
    lastname: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 20,
    }
}, { timestamps: true })

const authorModel = mongoose.models.authors || mongoose.model("authors", authorSchema);

export default authorModel;