const router = require("express").Router()
const User = require("../models/user.model")

// READ: Get list of completed sections
router.get("/:_id", (req, res, next) => {
    const { _id } = req.params

    // checks if user id provided
    if (!_id) {
        return res.status(400).json({ message: "No valid parameters provided."} )
    }

    User.findById(_id)
        .then(user => {

            // if no user found
            if (!user) {
                return res.status(400).json({message: "No user found."})
            }

            // send list of ids of completed lessons
            res.json({lessonIds: user.lessonIds})
        })
        .catch(err => {
            console.log("error while reading lessonIds: ", err)
            next(err)
        })
})

// CREATE: Add lesson id to list 
router.put("/", (req, res, next) => {
    const { _id, lessonId } = req.body

    // checks if valid parameters provided
    if (!_id || !lessonId) {
        return res.status(400).json({message: "No valid parameters provided."})
    }

    User.findByIdAndUpdate(_id, {$addToSet: {lessonIds: lessonId}}, {new: true})
        .then(user => {
            res.status(201).json({lessonIds: user.lessonIds})
        })
        .catch(err => {
            console.log("error while updating lessonIds: ", err)
            next(err)
        })
})

module.exports = router