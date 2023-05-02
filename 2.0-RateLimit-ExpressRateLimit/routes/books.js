let express = require('express')
let router = express.Router();
const fs = require('fs').promises;

let booksList;
fs.readFile("./routes/books.json")
    .then(contents => {
        booksList = contents;
    })
    .catch(err => {
        console.error(`Could not read books.json file: ${err}`);
        process.exit(1);
    });

let requestHandler = function(req, res, next){
    //res.set('Content-Type', 'application/json')
    let list = JSON.parse(booksList)
    res.send(list)
}
// Home page
router.get('/', requestHandler)

module.exports = {
	name: "books API",
	description: "API to access books data",
    path: "/books",
	router,
}

//module.exports = router