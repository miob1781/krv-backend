const router = require("express").Router()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const User = require("../models/user.model")
const isAuthenticated = require("../middleware/jwt.middleware")

// number of salt rounds used for encryption
const saltRounds = 10

// regex pattern used for password
const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

// creates new user
router.post("/signup", (req, res, next) => {
    const { username, password } = req.body

    // checks if username provided
    if (!username) {
        return res.status(400).json({ errorMessage: "Please provide your username." })
    }

    // checks if password provided
    if (!password) {
        return res.status(400).json({ errorMessage: "Please provide your password." })
    }

    // checks if password matches regex
    if (!regex.test(password)) {
        return res.status(400).json({
            errorMessage:
                "Password needs to have at least 8 characters and must contain at least one number, one lowercase and one uppercase letter.",
        });
    }

    // creates salt
    bcrypt.genSalt(saltRounds)
        .then(salt => {
            return bcrypt.hash(password, salt)
        })

        // hashes password
        .then(hashedPassword => {
            return User.create({
                username,
                password: hashedPassword
            })
        })
        // })
        .then(newUser => {

            // creates auth token
            const authToken = jwt.sign(
                {
                    userId: newUser._id,
                    username: newUser.username
                },
                process.env.TOKEN_SECRET,
                { algorithm: "HS256", expiresIn: "7d" }
            )

            // sends auth token to user
            return res.json({ authToken })
        })
        .catch(err => {
            if (err instanceof mongoose.Error.ValidationError) {
                return res.status(400).json({ errorMessage: err.message })
            }
            if (err.code === 11000) {
                return res.status(400).json({ errorMessage: "Der Benutzername ist bereits vergeben." })
            }
            return res.status(500).json({ errorMessage: err.message })
        })
})

router.post("/login", (req, res, next) => {
    const { username, password } = req.body

    // checks if username provided
    if (!username) {
        return res.status(400).json({ errorMessage: "Please provide your username." })
    }

    // checks if password provided
    if (!password) {
        return res.status(400).json({ errorMessage: "Please provide your password." })
    }

    // checks if password matches regex
    if (!regex.test(password)) {
        return res.status(400).json({
            errorMessage:
                "Password needs to have at least 8 characters and must contain at least one number, one lowercase and one uppercase letter.",
        });
    }

    User.findOne({ username })
        .then(user => {

            // checks if user with this username exists
            if (!user) {
                return res.status(400).json({ errorMessage: "Der Benutzername oder das Passwort sind falsch." })
            }

            // hashes and compares password
            bcrypt.compare(password, user.password)
                .then(isSamePassword => {
                    if (!isSamePassword) {
                        return res.status(400).json({ errorMessage: "Der Benutzername oder das Passwort sind falsch." })
                    }

                    // creates auth token
                    const authToken = jwt.sign(
                        {
                            userId: user._id,
                            username: user.username
                        },
                        process.env.TOKEN_SECRET,
                        { algorithm: "HS256", expiresIn: "6h" }
                    )

                    // sends auth token to user
                    return res.json({ authToken })
                })
        })
        .catch(err => next(err))
})

// verify account
router.get("/verify", isAuthenticated, (req, res, next) => {
    res.json(req.payload)
})

// edit account
router.put("/", isAuthenticated, (req, res, next) => {
    const { userId, username, password } = req.body

    // checks if userId provided
    if (!userId) {
        return res.status(400).json({ errorMessage: "No userId provided." })
    }

    // checks if username provided
    if (!username) {
        return res.status(400).json({ errorMessage: "Please provide your username." })
    }

    // checks if password provided
    if (!password) {
        return res.status(400).json({ errorMessage: "Please provide your password." })
    }

    // checks if password matches regex
    if (!regex.test(password)) {
        return res.status(400).json({
            errorMessage:
                "Password needs to have at least 8 characters and must contain at least one number, one lowercase and one uppercase letter.",
        });
    }

    // creates salt
    bcrypt.genSalt(saltRounds)
        .then(salt => {
            return bcrypt.hash(password, salt)
        })

        // hashes password
        .then(hashedPassword => {
            return User.findByIdAndUpdate(userId, {
                username,
                password: hashedPassword
            }, { new: true })
        })
        .then(newUser => {

            // creates auth token
            const authToken = jwt.sign(
                {
                    userId: newUser._id,
                    username: newUser.username
                },
                process.env.TOKEN_SECRET,
                { algorithm: "HS256", expiresIn: "7d" }
            )

            // sends auth token to user
            return res.json({ authToken })
        })
        .catch((err) => {
            console.log("Error while updating user: ", err)
            if (err instanceof mongoose.Error.ValidationError) {
                return res.status(400).json({ errorMessage: err.message })
            }
            if (err.code === 11000) {
                return res.status(400).json({ errorMessage: "Der Benutzername ist bereits vergeben." })
            }
            return res.status(500).json({ errorMessage: err.message })
        })
})

// delete user
router.delete("/:userId", isAuthenticated, (req, res, next) => {
    const { userId } = req.params

    User.findByIdAndDelete(userId)
        .then(() => {
            res.sendStatus(204)
        })
        .catch(err => {
            console.log("Error while deleting user: ", err)
            next(err)
        })
})

module.exports = router