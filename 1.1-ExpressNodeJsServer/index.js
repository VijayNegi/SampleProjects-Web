// Simple NodeJs server with express

const express = require('express')
const serveIndex = require('serve-index')
const port = 3000
const app = express()

// middleware function
app.use( (req, res, next)=>{
    console.log('Time: ',Date.now())
    next()
})

// middleware function to handle only specific path
app.use('/request-type', (req, res, next)=>{
    console.log('Request type: ', req.method)
    next();
})
// NOTE: when running from VSCode, this will pick root public folder 
// because how VSCode servers the current file path
app.use('/public',express.static('public'))
app.use('/public',serveIndex('public'))

// handle get request
app.get('/',(req,res) => {
    res.send("Successful response.")
})

app.listen(port,()=>{ console.log("Express server running....")})