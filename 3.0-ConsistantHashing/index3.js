// Nodes moved while rehashing
const crypto = require('crypto');

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
console.log(`${moved_ids} ids moved, ${percent_moved.toFixed(2)}%`);
