const crypto = require('crypto');
const { shuffle } = require('lodash');

const REPLICAS = 3;
const PARTITION_POWER = 16;
const PARTITION_SHIFT = 32 - PARTITION_POWER;
const PARTITION_MAX = Math.pow(2, PARTITION_POWER) - 1;
const NODE_COUNT = 256;
const ZONE_COUNT = 16;
const DATA_ID_COUNT = 10000000;

const node2zone = [];
while (node2zone.length < NODE_COUNT) {
  let zone = 0;
  while (zone < ZONE_COUNT && node2zone.length < NODE_COUNT) {
    node2zone.push(zone);
    zone++;
  }
}
const part2node = [];
for (let part = 0; part < Math.pow(2, PARTITION_POWER); part++) {
  part2node.push(part % NODE_COUNT);
}
shuffle(part2node);
const node_counts = new Array(NODE_COUNT).fill(0);
const zone_counts = new Array(ZONE_COUNT).fill(0);
for (let data_id = 0; data_id < DATA_ID_COUNT; data_id++) {
  const data_id_str = data_id.toString();
  let part = (crypto.createHash('md5').update(data_id_str).digest().readUInt32BE(0) >>> PARTITION_SHIFT);
  const node_ids = [part2node[part]];
  const zones = [node2zone[node_ids[0]]];
  node_counts[node_ids[0]]++;
  zone_counts[zones[0]]++;
  for (let replica = 1; replica < REPLICAS; replica++) {
    while (node_ids.includes(part2node[part]) && zones.includes(node2zone[part2node[part]])) {
      part++;
      if (part > PARTITION_MAX) {
        part = 0;
      }
    }
    node_ids.push(part2node[part]);
    zones.push(node2zone[node_ids[node_ids.length - 1]]);
    node_counts[node_ids[node_ids.length - 1]]++;
    zone_counts[zones[zones.length - 1]]++;
  }
}

const desired_count_per_node = (DATA_ID_COUNT / NODE_COUNT) * REPLICAS;
console.log(`${desired_count_per_node}: Desired data ids per node`);
const max_count_per_node = Math.max(...node_counts);
const over_per_node = (max_count_per_node - desired_count_per_node) / desired_count_per_node * 100.0;
console.log(`${max_count_per_node}: Most data ids on one node, ${over_per_node.toFixed(2)}% over`);
const min_count_per_node = Math.min(...node_counts);
const under_per_node = (desired_count_per_node - min_count_per_node) / desired_count_per_node * 100.0;
console.log(`${min_count_per_node}: Least data ids on one node, ${under_per_node.toFixed(2)}% under`);

const desired_count_per_zone = (DATA_ID_COUNT / ZONE_COUNT) * REPLICAS;
console.log(`${desired_count_per_zone}: Desired data ids per zone`);
const max_count_per_zone = Math.max(...zone_counts);
const over_per_zone = (max_count_per_zone - desired_count_per_zone) / desired_count_per_zone * 100.0;
console.log(`${max_count_per_zone}: Most data ids in one zone, ${over_per_zone.toFixed(2)}% over`);
const min_count_per_zone = Math.min(...zone_counts);
const under_per_zone = (desired_count_per_zone - min_count_per_zone) / desired_count_per_zone * 100.0;
console.log(`${min_count_per_zone}: Least data ids in one zone, ${under_per_zone.toFixed(2)}% under`);
