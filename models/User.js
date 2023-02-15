const {model, Schema } = require("mongoose")

const noteModel = new Schema({
    text: {
        type: string,
        required: true
    },
    paragraphId: {
        type: string,
        required: true
    }
})

const userModel = new Schema({
    email: {
        type: string,
        required: true
    },
    password: {
        type: string,
        required: true
    },
    lessonIds: [{
        type: string
    }],
    notes: [noteModel]
})

const User = model("User", userModel)

module.exports = User