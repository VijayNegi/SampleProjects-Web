
const crypto = require('crypto');

const REPLICAS = 3;
const PARTITION_POWER = 16;
const PARTITION_SHIFT = 32 - PARTITION_POWER;
const PARTITION_MAX = Math.pow(2, PARTITION_POWER) - 1;
const NODE_COUNT = 256;
const DATA_ID_COUNT = 10000000;

const part2node = [];
for (let part = 0; part < Math.pow(2, PARTITION_POWER); part++) {
  part2node.push(part % NODE_COUNT);
}
const node_counts = new Array(NODE_COUNT).fill(0);
for (let data_id = 0; data_id < DATA_ID_COUNT; data_id++) {
  const data_id_str = data_id.toString();
  let part = (crypto.createHash('md5').update(data_id_str).digest().readUInt32BE(0) >>> PARTITION_SHIFT);
  const node_ids = [part2node[part]];
  node_counts[node_ids[0]]++;
  for (let replica = 1; replica < REPLICAS; replica++) {
    while (node_ids.includes(part2node[part])) {
      part++;
      if (part > PARTITION_MAX) {
        part = 0;
      }
    }
    node_ids.push(part2node[part]);
    node_counts[node_ids[node_ids.length - 1]]++;
  }
}

const desired_count = (DATA_ID_COUNT / NODE_COUNT) * REPLICAS;
console.log(`${desired_count}: Desired data ids per node`);
const max_count = Math.max(...node_counts);
const over = (max_count - desired_count) / desired_count * 100.0;
console.log(`${max_count}: Most data ids on one node, ${over.toFixed(2)}% over`);
const min_count = Math.min(...node_counts);
const under = (desired_count - min_count) / desired_count * 100.0;
console.log(`${min_count}: Least data ids on one node, ${under.toFixed(2)}% under`);
