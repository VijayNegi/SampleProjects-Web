let express = require('express')
let router = express.Router();

const buckets = {};
const locker = {}

let requestHandler = function(req, res, next){
    res.send("V1 API is running... IN MEMORY LOCAL STORAGE   ")
}

let dataGetHandler = function(req, res, next){
        const bucketName = req.query.bucketName;
    if (buckets[bucketName]) {
        res.json(buckets[bucketName].data);
    } else {
        res.status(404).send(`No bucket with name ${bucketName} exists.`);
    }
}
// 'v1/MemoryBucket/List'
let listHandler = function (req, res) {
    res.json(Object.keys(buckets));
  };

// '/MemoryBucket/Bucket'

let buckethandler = function (req, res) {
    const bucketName = req.query.bucketName;
    if (buckets[bucketName]) {
        res.json(buckets[bucketName]);
    } else {
        res.status(404).send(`No bucket with name ${bucketName} exists.`);
    }
};

// '/MemoryBucket/:bucketName'
let bucketDeletehandler = function (req, res) {
    const bucketName = req.params.bucketName;
    if (buckets[bucketName]) {
      delete buckets[bucketName];
      res.sendStatus(204);
    } else {
      res.status(404).send(`No bucket with name ${bucketName} exists.`);
    }
  };
  // '/MemoryBucket/Set'
  let bucketSethandler = function (req, res) {
    const bucketName = req.query.bucketName;
    const data = req.body;
    createOrGetBucket(bucketName).data = data;
    res.json(data);
  };
  
  // '/MemoryBucket/Update'
  let bucketUpdatehandler = function (req, res) {
    const bucketName = req.query.bucketName;
    const key = req.query.key;
    const value = req.query.value;
    const bucket = createOrGetBucket(bucketName);
    bucket.data[key] = value;
    res.json(bucket.data);
  };
  
  function createOrGetBucket(bucketName) {
    if (!buckets[bucketName]) {
      buckets[bucketName] = new Bucket(bucketName);
    }
    return buckets[bucketName];
  }
  
  class Bucket {
    constructor(name) {
      this.name = name;
      this.data = {};
    }
  }


// Home page for this router
router.get('/', requestHandler)
router.get('/data', dataGetHandler)

module.exports = {
	name: "users API",
	description: "API to access user data",
    path: "/v1",
	router,
}