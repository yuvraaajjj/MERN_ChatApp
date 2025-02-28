const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    lastname: {
        type: String
    },
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String,
    },
    dob: {
        type: Date
    }
}, {timestamps: true})

const User = mongoose.model("user",userSchema)

module.exports = User