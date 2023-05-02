let express = require('express')
let router = express.Router();


let requestHandler = function(req, res, next){
    res.send("you are on Users Page")
}
// Home page
router.get('/', requestHandler)

module.exports = {
	name: "users API",
	description: "API to access user data",
    path: "/users",
	router,
}

//module.exports = router