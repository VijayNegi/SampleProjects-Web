const express = require('express')
const port = 3000

let logger = require('morgan')
var path = require('path');
const { getFiles } = require("./util/functions")
const { rateLimiterUsingThirdParty, customRedisRateLimiter, MyrateLimiter } = require('./middlewares/index')

// basic app setup
const app = express()
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

const limiter = MyrateLimiter({
	windowMs: 1 * 60 * 1000, // 1 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// rate limiter
app.use(limiter);
//app.use(customRedisRateLimiter);

// load Routes
let routes = getFiles("./routes/",".js")
if(routes.length == 0 ){
    console.log("No APIs to load")
}
routes.forEach((f,i) => {
    const route = require(`./routes/${f}`)
    app.use(route.path,route.router)
    console.log(`${i+1}. ${route.name} loaded`)
});

app.listen(port,()=>{ console.log("Express server running....")})