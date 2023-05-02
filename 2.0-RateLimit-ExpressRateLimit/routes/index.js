let express = require('express')
let router = express.Router();


let requestHandler = function(req, res, next){
    res.send("you are on Home Page, Yay!!!")
}
// Home page
router.get('/', requestHandler)

module.exports = {
	name: "home API",
	description: "API to access home page",
    path: '/',
	router,
}
//module.exports = router