const crypto = require('crypto');
const { shuffle } = require('lodash');
const { performance } = require('perf_hooks');

class Ring {
  constructor(nodes, part2node, replicas) {
    this.nodes = nodes;
    this.part2node = part2node;
    this.replicas = replicas;
    const partitionPower = Math.log2(part2node.length);
    if (2 ** partitionPower !== part2node.length) {
      throw new Error("part2node's length is not an exact power of 2");
    }
    this.partitionShift = 32 - partitionPower;
  }

  getNodes(dataId) {
    const dataIdStr = dataId.toString();
    let part = crypto
      .createHash('md5')
      .update(dataIdStr)
      .digest()
      .readUInt32BE(0) >>> this.partitionShift;
    const nodeIds = [this.part2node[part]];
    const zones = [this.nodes[nodeIds[0]].zone];
    for (let replica = 1; replica < this.replicas; replica++) {
      while (
        nodeIds.includes(this.part2node[part]) &&
        zones.includes(this.nodes[this.part2node[part]].zone)
      ) {
        part++;
        if (part >= this.part2node.length) {
          part = 0;
        }
      }
      nodeIds.push(this.part2node[part]);
      zones.push(this.nodes[this.part2node[part]].zone);
    }
    return nodeIds.map((nodeId) => this.nodes[nodeId]);
  }
}
// write a function that builds a ring
// given a set of nodes, partition power, and replicas
//  - partition power is the power of 2 that is the number of partitions
//  - replicas is the number of nodes that each data id is replicated to
//  - each node has a weight, which is the relative amount of data it should hold

function buildRing(nodes, partitionPower, replicas) {
  const begin = performance.now();
  const parts = 2 ** partitionPower;
  const totalWeight = Object.values(nodes).reduce(
    (sum, node) => sum + node.weight,
    0
  );
  Object.values(nodes).forEach((node) => {
    node.desiredParts = (parts / totalWeight) * node.weight;
  });
  const part2node = [];
  for (let part = 0; part < parts; part++) {
    const node = Object.values(nodes).find(
      (node) => node.desiredParts >= 1
    );
    if (node) {
      node.desiredParts--;
      part2node.push(node.id);
    } else {
      const node = Object.values(nodes).find(
        (node) => node.desiredParts >= 0
      );
      node.desiredParts--;
      part2node.push(node.id);
    }
  }
  shuffle(part2node);
  const ring = new Ring(nodes, part2node, replicas);
  console.log(`${(performance.now() - begin).toFixed(2)}ms to build ring`);
  return ring;
}

function testRing(ring) {
  const begin = performance.now();
  const DATA_ID_COUNT = 10000000;
  const nodeCounts = {};
  const zoneCounts = {};
  for (let dataId = 0; dataId < DATA_ID_COUNT; dataId++) {
    const nodes = ring.getNodes(dataId);
    nodes.forEach((node) => {
      nodeCounts[node.id] = (nodeCounts[node.id] || 0) + 1;
      zoneCounts[node.zone] = (zoneCounts[node.zone] || 0) + 1;
    });
  }
  console.log(`${(performance.now() - begin).toFixed(2)}ms to test ring`);
  const totalWeight = Object.values(ring.nodes).reduce(
    (sum, node) => sum + node.weight,
    0
  );
  let maxOver = 0;
  let maxUnder = 0;
  Object.values(ring.nodes).forEach((node) => {
    const desired = (DATA_ID_COUNT * ring.replicas * node.weight) / totalWeight; // explain this line
    const diff = nodeCounts[node.id] - desired;
    if (diff > 0) {
      const over = (100 * diff) / desired;
      if (over > maxOver) {
        maxOver = over;
      }
    } else {
      const under = (100 * -diff) / desired;
      if (under > maxUnder) {
        maxUnder = under;
      }
    }
  });
  console.log(`${maxOver.toFixed(2)}% max node over`);
  console.log(`${maxUnder.toFixed(2)}% max node under`);
  let maxZoneOver = 0;
  let maxZoneUnder = 0;
  const zones = [...new Set(Object.values(ring.nodes).map((node) => node.zone))];
  zones.forEach((zone) => {
    const zoneWeight = Object.values(ring.nodes)
      .filter((node) => node.zone === zone)
      .reduce((sum, node) => sum + node.weight, 0);
    const desired = (DATA_ID_COUNT * ring.replicas * zoneWeight) / totalWeight;
    const diff = zoneCounts[zone] - desired;
    if (diff > 0) {
      const over = (100 * diff) / desired;
      if (over > maxZoneOver) {
        maxZoneOver = over;
      }
    } else {
      const under = (100 * -diff) / desired;
      if (under > maxZoneUnder) {
        maxZoneUnder = under;
      }
    }
  });
  console.log(`${maxZoneOver.toFixed(2)}% max zone over`);
  console.log(`${maxZoneUnder.toFixed(2)}% max zone under`);
}

if (require.main === module) {
  const PARTITION_POWER = 16;
  const REPLICAS = 3;
  const NODE_COUNT = 256;
  const ZONE_COUNT = 16;
  const nodes = {};
  let nodeId = 0;
  let zone = 0;
  while (Object.keys(nodes).length < NODE_COUNT) {
    nodes[nodeId] = { id: nodeId, zone, weight: 1.0 + (nodeId % 2) };
    nodeId++;
    zone++;
    if (zone >= ZONE_COUNT) {
      zone = 0;
    }
  }
  const ring = buildRing(nodes, PARTITION_POWER, REPLICAS);
  testRing(ring);
}
