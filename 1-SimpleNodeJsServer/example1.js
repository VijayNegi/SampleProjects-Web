// Node server returning  with different content
const http = require("http")
const fs = require('fs').promises;

let indexFile;
const hostname = '127.0.0.1'
const port  = 3000
const requestListenerTXT = function (req, res) {
	console.log("\n New request type : text")
	res.statusCode = 200
	res.setHeader('Content-Type','text/plain')
	res.end('Hello Word\n')
}
const requestListenerJSON = function (req, res) {
	console.log("\n New request type : JSON")
	res.statusCode = 200
	res.setHeader('Content-Type','application/json')
	res.end(`{"message": "This is a JSON response"}`)
}
const requestListenerCSV = function (req, res) {
	console.log("\n New request type : CSV")
	res.statusCode = 200
	res.setHeader('Content-Type','text/csv')
	res.setHeader("Content-Disposition", "attachment;filename=oceanpals.csv")
	res.end(`id,name,email\n1,Sammy Shark,shark@ocean.com`)
}

const requestListenerHTML = function (req, res) {
	console.log("\n New request type : HTML")
	res.setHeader('Content-Type','text/html')
	res.writeHead(200)
	res.end(`<html><body><h1>This is HTML</h1></body></html>`);
}

const requestListenerHTMLFile = function (req, res) {
	console.log("\n New request type : HTML FIle")
    fs.readFile(__dirname + "/index.html")
        .then(contents => {
            res.setHeader("Content-Type", "text/html")
            res.writeHead(200)
            res.end(contents)
        })
        .catch(err => {
            res.writeHead(500)
            res.end(err)
            return
        })
}

const requestListenerHTMLFileCache = function (req, res) {
	console.log("\n New request type : HTML FIle Cache")
	res.setHeader("Content-Type", "text/html")
    res.writeHead(200)
    res.end(indexFile)
};

const server = http.createServer(requestListenerHTMLFileCache)

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

