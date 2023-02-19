const router = require("express").Router()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
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
        return res.status(400).json({ message: "Please provide your username." })
    }

    // checks if password provided
    if (!password) {
        return res.status(400).json({ message: "Please provide your password." })
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

            // checks if username is taken
            if (user) {
                return res.status(400).json({ message: "User with this username already exists." })
            }

            // creates salt
            return bcrypt.genSalt(saltRounds)
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
        .catch(err => {
            return res.status(400).json({ message: err.message })
        })
})

router.post("/login", (req, res, next) => {
    const { username, password } = req.body

    // checks if username provided
    if (!username) {
        return res.status(400).json({ message: "Please provide your username." })
    }

    // checks if password provided
    if (!password) {
        return res.status(400).json({ message: "Please provide your password." })
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
                return res.status(400).json({ message: "Wrong credentials." })
            }

            // hashes and compares password
            bcrypt.compare(password, user.password)
                .then(isSamePassword => {
                    if (!isSamePassword) {
                        return res.status(400).json({ message: "Wrong credentials." })
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

router.get("/verify", isAuthenticated, (req, res, next) => {
    res.json(req.payload)
})

module.exports = router