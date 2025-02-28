const mongoose = require("mongoose")

const messageSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.Mixed, 
        ref: function(){
            return typeof this.sender === 'string' ? null : "User"
        }
    },
    recipient: {
        type: mongoose.Schema.Types.Mixed, 
        ref: function(){
            return typeof this.sender === 'string' ? null : "User"
        }
    },
    text: String
},{timestamps: true})

const Message = mongoose.model("message", messageSchema)

module.exports = Message