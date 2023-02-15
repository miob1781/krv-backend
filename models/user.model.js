const {model, Schema } = require("mongoose")

const noteModel = new Schema({
    text: {
        type: String,
        required: true
    },
    paragraphId: {
        type: String,
        required: true
    }
})

const userModel = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    lessonIds: [{
        type: String
    }],
    notes: [noteModel]
})

const User = model("User", userModel)

module.exports = User