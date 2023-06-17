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