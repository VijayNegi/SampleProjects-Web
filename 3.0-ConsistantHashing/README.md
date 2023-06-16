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
9900989 ids moved, 99.01%
```
