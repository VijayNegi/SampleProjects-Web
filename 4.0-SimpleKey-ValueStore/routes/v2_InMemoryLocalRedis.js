let express = require('express')
let router = express.Router();

const redis = require('redis');
const client = redis.createClient();

client.on('error', (err) => console.log('Redis Client Error', err));
(async () => {
    await client.connect();
})()

let requestHandler = function(req, res, next){
    res.send("V2 API is running... IN MEMORY LOCAL STORAGE  with REDIS")
}

// Set a key-value pair in Redis
//app.get('/set/:key/:value', (req, res) => {
let setHandler = async function (req, res) {
    const { key, value } = req.params;
    await client.set('key', 'value');
    return res.json({ message: 'Key-value pair set successfully' });
    // client.set(key, value, (err, reply) => {
    //   if (err) {
    //     console.error(err);
    //     return res.status(500).json({ error: 'Internal server error' });
    //   }
    //   return res.json({ message: 'Key-value pair set successfully' });
    // });
  };
  
  // Get the value for a given key from Redis
  //app.get('/get/:key', (req, res) => {
let getHandler = async function (req, res) {
    const { key } = req.params;
    if (!client) 
        return res.status(500).json({ error: 'Internal server error' });
    const value = await client.get(key);
    if(value === null)
        return res.status(404).json({ error: 'Key not found' });
    return res.json({ key, value });

    // client.get(key, (err, value) => {
    //   if (err) {
    //     console.error(err);
    //     return res.status(500).json({ error: 'Internal server error' });
    //   }
    //   if (value === null) {
    //     return res.status(404).json({ error: 'Key not found' });
    //   }
    //   return res.json({ key, value });
    // });
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