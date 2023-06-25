let express = require('express')
const fs = require('fs').promises;

let indexFile
let router = express.Router();

fs.readFile(__dirname + "/../public/homepage.html")
    .then(contents => {
        indexFile = contents;
    })
    .catch(err => {
        console.error(`Could not read index.html file: ${err}`);
        process.exit(1);
    });

const requestHandler = function (req, res) {
	res.setHeader("Content-Type", "text/html")
    res.writeHead(200)
    res.end(indexFile)
};

//Home page
router.get('/', requestHandler)

module.exports = {
	name: "home API",
	description: "API to access home page",
    path: '/',
	router,
}
//module.exports = router