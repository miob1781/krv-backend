// create app instance
const express = require("express")
const app = express()

// import configuration for dotenv, enabling use of environment variables
require("dotenv/config")

// start listening
const PORT = process.env.PORT
app.listen(PORT, console.log(`Server listening on port ${PORT}.`))