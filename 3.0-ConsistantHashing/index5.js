const crypto = require('crypto');

const PARTITION_POWER = 23;
const PARTITION_SHIFT = 32 - PARTITION_POWER;
const NODE_COUNT = 65536;
const DATA_ID_COUNT = 100000000;

const part2node = [];
for (let part = 0; part < Math.pow(2, PARTITION_POWER); part++) {
  part2node.push(part % NODE_COUNT);
}
const node_counts = new Array(NODE_COUNT).fill(0);
for (let data_id = 0; data_id < DATA_ID_COUNT; data_id++) {
  const data_id_str = data_id.toString();
  const part = (crypto.createHash('md5').update(data_id_str).digest().readUInt32BE(0) >>> PARTITION_SHIFT);
  const node_id = part2node[part];
  node_counts[node_id]++;
}

const desired_count = DATA_ID_COUNT / NODE_COUNT;
console.log(`${desired_count}: Desired data ids per node`);
const max_count = Math.max(...node_counts);
const over = 100.0 * (max_count - desired_count) / desired_count;
console.log(`${max_count}: Most data ids on one node, ${over.toFixed(2)}% over`);
const min_count = Math.min(...node_counts);
const under = 100.0 * (desired_count - min_count) / desired_count;
console.log(`${min_count}: Least data ids on one node, ${under.toFixed(2)}% under`);
