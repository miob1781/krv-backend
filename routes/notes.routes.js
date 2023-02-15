const router = require("express").Router()
const User = require("../models/user.model")

// READ notes by user and paragraph id
router.get("/", (req, res, next) => {
    const { _id, paragraphId } = req.query

    // gets user by user id from DB
    User.findById( _id )
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

// CREATE new note
router.post("/", (req, res, next) => {
    const { _id, paragraphId, note } = req.body

    // gets user from DB
    User.findById(_id)
        .then(user => {
            $addToSet: { notes: note }
        })
})