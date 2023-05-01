// Node server with route handlings


// Node server returning  with different content
const http = require("http")
const fs = require('fs').promises;

let indexFile;
const hostname = '127.0.0.1'
const port  = 3000

const books = JSON.stringify([
    { title: "The Alchemist", author: "Paulo Coelho", year: 1988 },
    { title: "The Prophet", author: "Kahlil Gibran", year: 1923 }
])

const authors = JSON.stringify([
    { name: "Paulo Coelho", countryOfBirth: "Brazil", yearOfBirth: 1947 },
    { name: "Kahlil Gibran", countryOfBirth: "Lebanon", yearOfBirth: 1883 }
])

const requestListener = function (req, res) {
	console.log(`\n New request url ${req.url}`)
	res.setHeader('Content-Type','application/json')
    switch(req.url) {
        case "/books":
            res.writeHead(200)
            res.end(books)
            break
        case "/authors":
            res.writeHead(200)
            res.end(authors)
            break
        default:
            res.writeHead(500)
            res.end(JSON.stringify({error:"Resource Not Found"}))
    }
}

const server = http.createServer(requestListener)

fs.readFile(__dirname + "/index.html")
    .then(contents => {
        indexFile = contents;
    })
    .catch(err => {
        console.error(`Could not read index.html file: ${err}`);
        process.exit(1);
    });

server.listen(port,hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`)
})

