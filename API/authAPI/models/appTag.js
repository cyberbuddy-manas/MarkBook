const mongoose = require("mongoose");

const appTag = new mongoose.Schema({
    appUser: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "appUser"
    },
    title: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    createdAt: {
        type: String,
        required: true,
        default: Date.now().toString()
    },
    public: {
        type: Boolean,
        default: true
    },
});

const AppTag = mongoose.model("appTag", appTag);
module.exports = AppTag;