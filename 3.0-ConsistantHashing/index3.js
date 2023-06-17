// Nodes moved while rehashing
//1.  Key Mod Method
const crypto = require('crypto');
const { bisectLeft } = require('./bisect');

const NODE_COUNT = 100;
const NEW_NODE_COUNT = 101;
const DATA_ID_COUNT = 10000000;

let moved_ids = 0;
for (let data_id = 0; data_id < DATA_ID_COUNT; data_id++) {
  const data_id_str = data_id.toString();
  const hsh = crypto.createHash('md5').update(data_id_str).digest();
  const node_id = hsh.readUInt32BE(0) % NODE_COUNT;
  const new_node_id = hsh.readUInt32BE(0) % NEW_NODE_COUNT;
  if (node_id !== new_node_id) {
    moved_ids++;
  }
}

const percent_moved = (moved_ids / DATA_ID_COUNT) * 100.0;
console.log(`For key Mod Method: ${moved_ids} ids moved, ${percent_moved.toFixed(2)}%`);

// 2. Range key method

const node_range_starts = [];
for (let node_id = 0; node_id < NODE_COUNT; node_id++) {
  node_range_starts.push((DATA_ID_COUNT / NODE_COUNT) * node_id);
}

const new_node_range_starts = [];
for (let new_node_id = 0; new_node_id < NEW_NODE_COUNT; new_node_id++) {
  new_node_range_starts.push((DATA_ID_COUNT / NEW_NODE_COUNT) * new_node_id);
}

let moved_ids2 = 0;
for (let data_id = 0; data_id < DATA_ID_COUNT; data_id++) {
  const data_id_str = data_id.toString();
  const hsh = crypto.createHash('md5').update(data_id_str).digest();
  const node_id = bisectLeft(node_range_starts, hsh.readUInt32BE(0) % DATA_ID_COUNT) % NODE_COUNT;
  const new_node_id = bisectLeft(new_node_range_starts, hsh.readUInt32BE(0) % DATA_ID_COUNT) % NEW_NODE_COUNT;
  if (node_id !== new_node_id) {
    moved_ids2++;
  }
}

const percent_moved2 = (moved_ids2 / DATA_ID_COUNT) * 100.0;
console.log(`For Range Mod Method : ${moved_ids2} ids moved, ${percent_moved2.toFixed(2)}%`);

