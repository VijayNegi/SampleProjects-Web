Consistant Hashing

1. [Example 1](index1.js)
Ref - https://medium.com/@saransh98/node-js-implement-consistent-hashing-f024e43b4259
 Dynamically adding server nodes, 
 - Not very good example

2. [ Example 2](index2.js)
Ref - https://docs.openstack.org/swift/latest/ring_background.html
Example showing distribution of ids over keys by hashing algorithm
Benefit of using a hashing algorithm like MD5 is that the resulting hashes have a known even distribution, meaning your ids will be evenly distributed without worrying about keeping the id values themselves evenly distributed.
Output - 
```
100000: Desired data ids per node
index2.js:18
100695: Most data ids on one node, 0.69% over
index2.js:22
99073: Least data ids on one node, 0.93% under
```

3. [ Example 3](index3.js)
Ref - https://docs.openstack.org/swift/latest/ring_background.html
Example to demostrate problem while rehashing, i.e. the number of IDs moved to a new node.
Output - 
```
For key Mod Method: 9900989 ids moved, 99.01%
For Range Mod Method : 4897496 ids moved, 48.97%
```

5. [ Example 4](index4.js)
Ref - https://docs.openstack.org/swift/latest/ring_background.html
Example to demonstrate virtual node solution for rehashing problem
Output - 
```
99763 ids moved, 1.00%
```

6. [ Example 5](index5.js)
Ref - https://docs.openstack.org/swift/latest/ring_background.html
Example to demonstrate wisely choosing virtual node setting as vritual nodes limit the real nodes.

A good rule to follow might be to calculate 100 virtual nodes to each real node at maximum capacity. This would allow you to alter the load on any given node by 1%, even at max capacity, which is pretty fine tuning. So now we’re at 6,000,000 virtual nodes for a max capacity cluster of 60,000 real nodes.

Note -  +–10% seems a bit high, but I reran with 65,536 partitions and 256 nodes and got +–0.4% so it’s just that our sample size (100m) is too small for our number of partitions (8m). 

Output - 
```
1525.87890625: Desired data ids per node
1683: Most data ids on one node, 10.30% over
1360: Least data ids on one node, 10.87% under
```

6. [ Example 6](index6.js)
Ref - https://docs.openstack.org/swift/latest/ring_background.html
Example :  how to increase the durability and availability of our data in the cluster.
i.e. Replication in Consistant hashing in single ring

Output - 
```
117187.5: Desired data ids per node
118133: Most data ids on one node, 0.81% over
116093: Least data ids on one node, 0.93% under
```

7. [ Example 7](index7.js)
Ref - https://docs.openstack.org/swift/latest/ring_background.html
Example :  introduce zoning while replication

Output - 
```
117187.5: Desired data ids per node
118133: Most data ids on one node, 0.81% over
116093: Least data ids on one node, 0.93% under
```

7. [ Example 8](index8.js)
Ref - https://docs.openstack.org/swift/latest/ring_background.html
Example :  This alternate method doesn’t use partitions at all, but instead just assigns anchors to the nodes within the hash space. Finding the first node for a given hash just involves walking this anchor ring for the next node, and finding additional nodes works similarly as before. To attain the equivalent of our virtual nodes, each real node is assigned multiple anchors.

this method also gives much less control over the distribution. To get better distribution, you have to add more virtual nodes, which eats up more memory and takes even more time to build the ring and perform distinct node lookups. The most common operation, data id lookup, can be improved (by predetermining each virtual node’s failover nodes, for instance) but it starts off so far behind our first approach that we’ll just stick with that.
Output - 
```
117187.5: Desired data ids per node
351282: Most data ids on one node, 199.76% over
15965: Least data ids on one node, 86.38% under
1875000: Desired data ids per zone
2248496: Most data ids in one zone, 19.92% over
1378013: Least data ids in one zone, 26.51% under
```

7. [ Example 9](index9.js)
Ref - https://docs.openstack.org/swift/latest/ring_background.html
Example :  Final example class with Nodes with weight 
Output - Output does not match with article , need to look bug in weights code
```
4642.97ms to build ring
43667.79ms to test ring
34.90% max node over
17.46% max node under
33.38% max zone over
16.72% max zone under
```

