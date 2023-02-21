// create app instance
const express = require("express")
const app = express()

// enable use of environment variables
require("dotenv/config")

// connect to database
require("./db")

// further configuration
app.set("trust proxy", 1)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// enable cors
const cors = require("cors")
app.use(cors({
    credentials: true,
    origin: process.env.ORIGIN
}))            

// use logging middleware
const morgan = require("morgan")
app.use(morgan("dev"))

// routes
const isAuthenticated = require("./middleware/jwt.middleware")
app.use("/auth", require("./routes/user.routes"))
app.use("/notes", isAuthenticated, require("./routes/notes.routes"))
app.use("/lessons", isAuthenticated, require("./routes/lessons.routes"))

// error-handling
app.use((req, res) => {
    // this middleware runs whenever requested page is not available
    res.status(404).json({ errorMessage: "This route is not available." })
})            

app.use((err, req, res) => {
    // whenever you call next(err), this middleware will handle the error
    console.error("ERROR", req.method, req.path, err)

    // if a token is not valid, send a 401 error
    if (err.name === "UnauthorizedError") {
        res.status(401).json({ message: "invalid token..." })
    }        

    // only render if the error ocurred before sending the response
    if (!res.headersSent) {
        res.status(500).json({
            errorMessage: "Internal server error. Check the server console",
        })        
    }        
})        

// start listening
const PORT = process.env.PORT
app.listen(PORT, console.log(`Server listening on port ${PORT}.`))