//  benefit of using a hashing algorithm like MD5 is that the resulting hashes have a known even distribution, 
// meaning your ids will be evenly distributed without worrying about keeping the id values themselves evenly distributed.
const crypto = require('crypto');

const NODE_COUNT = 100;
const DATA_ID_COUNT = 10000000;

const nodeCounts = new Array(NODE_COUNT).fill(0);

for (let dataId = 0; dataId < DATA_ID_COUNT; dataId++) {
  const dataIdString = dataId.toString();
  const hsh = crypto.createHash('md5').update(dataIdString).digest();
  const nodeId = hsh.readUInt32BE(0) % NODE_COUNT;
  nodeCounts[nodeId] += 1;
}

const desiredCount = DATA_ID_COUNT / NODE_COUNT;
console.log(`${desiredCount}: Desired data ids per node`);

const maxCount = Math.max(...nodeCounts);
const over = 100.0 * (maxCount - desiredCount) / desiredCount;
console.log(`${maxCount}: Most data ids on one node, ${over.toFixed(2)}% over`);

const minCount = Math.min(...nodeCounts);
const under = 100.0 * (desiredCount - minCount) / desiredCount;
console.log(`${minCount}: Least data ids on one node, ${under.toFixed(2)}% under`);
