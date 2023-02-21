const router = require("express").Router()
const User = require("../models/user.model")

// READ: Get notes of lesson
router.get("/", (req, res, next) => {
    const { userId, lessonId } = req.query

    // checks if valid parameters provided
    if (!userId || !lessonId) {
        return res.status(400).json({ message: "No valid parameters provided." })
    }

    User.findById(userId)
        .then(user => {

            // checks if user exists
            if (!user) {
                return res.status(400).json({ message: "This user does not exist." })
            }

            // sends notes of section to user
            const lessonNotes = user.notes.find(lessonNotesObject => lessonNotesObject.lessonId === lessonId)
            return res.json({ lessonNotes })
        })
        .catch(err => {
            console.log("Error while loading notes: ", err)
            next(err)
        })
})

// CREATE, UPDATE, or DELETE notes
router.post("/", (req, res, next) => {
    const { userId, note } = req.body

    // checks if valid parameters provided
    if (!userId || !note || !note.paragraphId) {
        return res.send.status(400).json({ message: "No valid parameters provided." })
    }

    // gets lessonId from paragraphId
    const lessonId = note.paragraphId.split("-").slice(0, 2).join("-")

    // gets user from DB
    User.findById(userId)
        .then(user => {

            // checks if user exists
            if (!user) {
                return res.status(400).json({ message: "This user does not exist." })
            }

            // checks if lesson already has an array with notes
            const lessonNotes = user.notes.find(lessonNotes => lessonNotes.lessonId === lessonId)
            if (lessonNotes) {

                // removes old note for paragraph if it exists and adds new note if it exists
                lessonNotes.notes = lessonNotes.notes.filter(oldNote => oldNote.paragraphId !== note.paragraphId)
                if (note.text) {
                    lessonNotes.notes.push(note)
                }
            } else {

                // creates new array if lesson has no notes yet and adds note to it if it exists
                if (note.text) {
                    user.notes.push({
                        lessonId,
                        notes: [note]
                    })
                }
            }

            // updates user data with new notes array
            User.findByIdAndUpdate(userId, { notes: user.notes }, { new: true })
                .then(user => {

                    // sends new notes of section to user
                    const lessonNotes = user.notes.filter(lessonNotesObject => lessonNotesObject.lessonId === lessonId)
                    res.status(201).json({ lessonNotes })
                })
                .catch(err => {
                    console.log("Error while updating notes: ", err)
                    next(err)
                })
        })
})

module.exports = router