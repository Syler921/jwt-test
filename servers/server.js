require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

console.log(jwt)
app.use(express.json())



app.listen(3000)