let express = require('express')
let router = express.Router();

const redis = require('redis');
const client = redis.createClient();

const buckets = {};
const locker = {}

let requestHandler = function(req, res, next){
    res.send("V2 API is running... IN MEMORY LOCAL STORAGE  with REDIS")
}

// Set a key-value pair in Redis
//app.get('/set/:key/:value', (req, res) => {
let getHandler = function (req, res) {
    const { key, value } = req.params;
    client.set(key, value, (err, reply) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      return res.json({ message: 'Key-value pair set successfully' });
    });
  };
  
  // Get the value for a given key from Redis
  //app.get('/get/:key', (req, res) => {
let setHandler = function (req, res) {
    const { key } = req.params;
    client.get(key, (err, value) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (value === null) {
        return res.status(404).json({ error: 'Key not found' });
      }
      return res.json({ key, value });
    });
  };
  



// Home page for this router
router.get('/', requestHandler)
router.get('/get/:key', getHandler)
router.get('/set/:key/:value', setHandler)

module.exports = {
	name: "v2 API",
	description: "API to access in Memory data with Redis",
    path: "/v2",
	router,
}