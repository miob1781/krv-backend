const router = require("express").Router()
const User = require("../models/user.model")

// READ: Get all lessonIds
router.get("/:userId", (req, res, next) => {
    const { userId } = req.params

    // checks if userId provided
    if (!userId) {
        return res.status(400).json({ errorMessage: "No user id provided." })
    }

    User.findById(userId)
        .then(user => {

            // checks if user exists
            if (!user) {
                return res.status(400).json({ errorMessage: "This user does not exist." })
            }

            // sends lessonIds to user
            return res.json({ lessonIds: user.lessonIds })
        })
        .catch(err => {
            console.log("Error while loading lessonIds: ", err)
            next(err)
        })
})

// CREATE: Add lesson id to list 
router.post("/", (req, res, next) => {
    const { userId, lessonId } = req.body

    // checks if valid parameters provided
    if (!userId || !lessonId) {
        return res.status(400).json({ errorMessage: "No valid parameters provided." })
    }

    User.findByIdAndUpdate(userId, { $addToSet: { lessonIds: lessonId } }, { new: true })
        .then(user => {

            // checks if user exists
            if (!user) {
                return res.status(400).json({ errorMessage: "User does not exist." })
            }

            // sends new lessonIds to user
            res.status(201).json({lessonIds: user.lessonIds})
        })
        .catch(err => {
            console.log("error while updating lessonIds: ", err)
            next(err)
        })
})

module.exports = router