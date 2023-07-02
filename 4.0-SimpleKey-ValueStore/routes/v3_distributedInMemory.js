let express = require('express')
let router = express.Router();

const ch = require('../util/consistantHashing');
const lb = new ch([],4);

const buckets = {};


let requestHandler = function(req, res, next){
    res.send("V3 API is running... IN MEMORY distributed STORAGE   ")
}

let getValue = async function(req, res, next){
    const bucketName = req.params.key;
    let port = lb.getNode(bucketName);
    if(port){
        console.log(`${port} get request`)
        let response = await fetch(`http://127.0.0.1:${port}/v1/get/${bucketName}`)
        if(response.status == 200){
            response = await response.json()
            res.json(response)
        }
        else{
            res.status(404).send(`No key with name ${bucketName} exists.`)
        }
    }else{
        res.status(404).send(`No key with name ${bucketName} exists.`)
    }
}
let addserver = function(req, res, next){
    const server = req.params.server;
    console.log(`${server} add request`)
    lb.addNode(server);
    res.json("Server added");
}

let removeserver = function(req, res, next){
    const server = req.params.server;
    console.log(`${server} remove request`)
    lb.removeNode(server);
    res.json("Server removed");
}

let setValue = async function (req, res) {
    const bucketName = req.params.key;
    const data = req.params.value;
    let port = lb.getNode(bucketName);
    if(port){
        console.log(`${port} set request`)
        let response = await fetch(`http://127.0.0.1:${port}/v1/set/${bucketName}/${data}`)
        if(response.status == 200){
            response = await response.json()
            res.json(response)
        }
        else{
            res.status(404).send(`No key with name ${bucketName} exists.`)
        }
    }else{
        res.status(404).send(`No bucket with name ${bucketName} exists.`)
    }
};


// Home page for this router
router.get('/', requestHandler)
router.get('/add/:server', addserver)
router.get('/remove/:server', removeserver)
router.get('/get/:key', getValue)
router.get('/set/:key/:value', setValue)


module.exports = {
	name: "v3 API",
	description: "API to access distributed in Memory data",
    path: "/v3",
	router,
}