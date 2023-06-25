let express = require('express')
let router = express.Router();

const buckets = {};
const locker = {}

let requestHandler = function(req, res, next){
    res.send("V1 API is running... IN MEMORY LOCAL STORAGE   ")
}

let dataGetHandler = function(req, res, next){
    const bucketName = req.query.id;
    if (buckets[bucketName]) {
        res.json(buckets[bucketName].data);
    } else {
        res.status(404).send(`No bucket with name ${bucketName} exists.`);
    }
}
let dataGetParamHandler = function(req, res, next){
    const bucketName = req.params.id;
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
    const bucketName = req.query.id;
    if (buckets[bucketName]) {
        res.json(buckets[bucketName]);
    } else {
        res.status(404).send(`No bucket with name ${bucketName} exists.`);
    }
};

// '/MemoryBucket/:bucketName'
let bucketDeletehandler = function (req, res) {
    const bucketName = req.params.id;
    if (buckets[bucketName]) {
      delete buckets[bucketName];
      res.sendStatus(204);
    } else {
      res.status(404).send(`No bucket with name ${bucketName} exists.`);
    }
  };
  // '/MemoryBucket/set'
  let bucketSethandler = function (req, res) {
    const bucketName = req.query.id;
    const data = req.body;
    createOrGetBucket(bucketName).data = data;
    res.json(data);
  };

// '/MemoryBucket/set/id'
let bucketSetParamhandler = function (req, res) {
    const bucketName = req.params.id;
    const data = req.body;
    createOrGetBucket(bucketName).data = data;
    res.json(data);
    };
  
  // '/MemoryBucket/Update'
  let bucketUpdatehandler = function (req, res) {
    const bucketName = req.query.id;
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
router.get('/data/list', listHandler)
router.get('/data', dataGetHandler)
router.get('/data/get/:id', dataGetParamHandler)
router.post('/data/set', bucketSethandler)
router.post('/data/set/:id', bucketSetParamhandler)
router.delete('/data/:id', bucketDeletehandler)

module.exports = {
	name: "v1 API",
	description: "API to access in Memory data",
    path: "/v1",
	router,
}