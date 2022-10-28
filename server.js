require('dotenv').config()
require('express-async-errors')
const express = require('express')
const path = require('path')
const { logger , logEvents } = require('./middlewares/logger')
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOption = require('./configs/corsOptions')
const connectDB = require('./configs/dbConnect')
const mongoose = require('mongoose')
const app = express()

connectDB()

app.use(logger)

app.use(cors(corsOption))

app.use(express.json())

app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, '/public')))

app.use('/', require('./routes/root'))
app.use('/auth', require('./routes/auth'))
app.use('/users', require('./routes/user'))
app.use('/notes', require('./routes/note'))

app.all('*', (req, res) => {
    res.status(404)
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if(req.accepts('json')){
        res.json({ message: '404 Not Found'})
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)

const PORT = process.env.PORT || 8888

mongoose.connection.once('open', () => {
    console.log('Connected to the DB')
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})