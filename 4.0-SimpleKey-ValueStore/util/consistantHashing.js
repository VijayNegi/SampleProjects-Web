const crypto = require('crypto')
class consistantHashing{
    constructor(nodes, replicas = 3){
        this.replicas = replicas;
        this.nodes = [];
        this.keys = [];
        this.hashRing = {};
        for(const node of nodes){
            this.addNode(node);
        }
    }
    addNode(node){
        this.nodes.push(node);
        for(let i=0;i<this.replicas;i++){
            let key = this.getHash('${node}-replica-${i}');
            this.keys.push(key);
            this.hashRing[key] = node;
        }
        this.keys.sort();
    }
    removeNode(node){
        const nodeIndex = this.nodes.indexOf(node);
        if(nodeIndex == -1){
            return;
        }
        this.nodes.splice(nodeIndex,1);
        for(let i=0;i<this.replicas;i++){
            let key = this.getHash('${node}-replica-${i}');
            delete this.hashRing[key];
            const keyIndex = this.keys.indexOf(key);
            if(keyIndex == -1){
                continue;
            }
            this.keys.splice(keyIndex,1);
        }
    }
    getNode(key){
        if(this.keys.length == 0){
            return null;
        }
        const hash = this.getHash(key);
        const nodeKey = this.findClosestNodeKey(hash);
        return this.hashRing[nodeKey];
    }
    getHash(key){
        return crypto.createHash('md5').update(key).digest('hex');
    }
    findClosestNodeKey(hash){
        let low = 0;
        let high = this.keys.length - 1;
        while(low < high){
            let mid = Math.floor((low+high)/2);
            if(this.keys[mid] == hash){
                return this.keys[mid];
            }
            if(this.keys[mid] < hash){
                low = mid + 1;
            }else{
                high = mid;
            }
        }
        if(low == this.keys.length - 1){
            return this.keys[0];
        }else{
            return this.keys[low];
        }
    }
}
module.exports = consistantHashing
