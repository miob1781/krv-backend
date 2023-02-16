const router = require("express").Router()
const User = require("../models/user.model")

// READ notes by user and paragraph id
router.get("/", (req, res, next) => {
    const { _id, paragraphId } = req.query

    // checks if valid parameters provided
    if (!_id || !paragraphId) {
        return res.send.status(400).json({ message: "No valid parameters provided." })
    }

    // gets user by user id from DB
    User.findById(_id)
        .then(user => {

            // checks if user exists
            if (!user) {
                return res.send.status(400).json({ message: "User does not exist." })
            }

            // gets note from user data
            const note = user.notes.filter(note => paragraphId === note.paragraphId)

            // sends error message to user if note does not exist
            if (!note) {
                return res.status(400).json({ message: "Note does not exist." })
            }

            // sends note to user
            res.json({ note })
        })
        .catch(err => {
            console.log("Error while loading not: ", err)
            next(err)
        })
})

// CREATE, UPDATE, or DELETE notes
router.post("/", (req, res, next) => {
    const { _id, note } = req.body

    // checks if valid parameters provided
    if (!_id || !note || !note.paragraphId) {
        return res.send.status(400).json({ message: "No valid parameters provided." })
    }

    // gets user from DB
    User.findById(_id)

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
            User.findByIdAndUpdate(_id, { notes })
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