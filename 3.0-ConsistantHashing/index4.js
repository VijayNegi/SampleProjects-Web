const crypto = require('crypto');

const NODE_COUNT = 100;
const DATA_ID_COUNT = 10000000;
const VNODE_COUNT = 1000;

const vnode2node = [];
for (let vnode_id = 0; vnode_id < VNODE_COUNT; vnode_id++) {
  vnode2node.push(vnode_id % NODE_COUNT);
}
const new_vnode2node = [...vnode2node];
const new_node_id = NODE_COUNT;
let vnodes_to_reassign = VNODE_COUNT / (NODE_COUNT + 1);

while (vnodes_to_reassign > 0) {
  for (let node_to_take_from = 0; node_to_take_from < NODE_COUNT; node_to_take_from++) {
    for (let vnode_id = 0; vnode_id < VNODE_COUNT; vnode_id++) {
      if (vnode2node[vnode_id] === node_to_take_from) {
        vnode2node[vnode_id] = new_node_id;
        vnodes_to_reassign--;
        break;
      }
    }
    if (vnodes_to_reassign <= 0) {
      break;
    }
  }
}

let moved_ids = 0;
for (let data_id = 0; data_id < DATA_ID_COUNT; data_id++) {
  const data_id_str = data_id.toString();
  const hsh = crypto.createHash('md5').update(data_id_str).digest();
  const vnode_id = hsh.readUInt32BE(0) % VNODE_COUNT;
  const node_id = vnode2node[vnode_id];
  const new_node_id = new_vnode2node[vnode_id];
  if (node_id !== new_node_id) {
    moved_ids++;
  }
}

const percent_moved = (moved_ids / DATA_ID_COUNT) * 100.0;
console.log(`${moved_ids} ids moved, ${percent_moved.toFixed(2)}%`);
