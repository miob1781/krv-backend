const router = require("express").Router()
const User = require("../models/user.model")

// CREATE, UPDATE, or DELETE notes
router.post("/", (req, res, next) => {
    const { userId, note } = req.body

    // checks if valid parameters provided
    if (!userId || !note || !note.paragraphId) {
        return res.send.status(400).json({ message: "No valid parameters provided." })
    }

    // gets user from DB
    User.findById(userId)

        // creates new notes array
        .then(user => {
            user.notes = user.notes.filter(oldNote => oldNote.paragraphId !== note.paragraphId)
            if (note.text) {
                user.notes.push(note)
            }
            return user.notes
        })

        // updates user data with new notes array
        .then(notes => {
            User.findByIdAndUpdate(userId, { notes })
                .then(() => {
                    res.status(201).json({ message: "The user notes have been updated." })
                })
                .catch(err => {
                    console.log("Error while updating notes: ", err)
                    next(err)
                })
        })
})

module.exports = router