# impliment sample messsage queue example using RabbitMQ
https://github.com/amqp-node/amqplib/tree/main/examples/tutorials

# RabbitMQ tutorial - "Hello World!" — RabbitMQ

### Metadata

- Title: RabbitMQ tutorial - "Hello World!" — RabbitMQ
- URL: https://www.rabbitmq.com/tutorials/tutorial-one-javascript.html
### Highlights & Notes

- RabbitMQ is a message broker: it accepts and forwards messages. You can think about it as a post office: when you put the mail that you want posting in a post box, you can be sure that the letter carrier will eventually deliver the mail to your recipient. In this analogy, RabbitMQ is a post box, a post office, and a letter carrier.
- Producing means nothing more than sending. A program that sends messages is a producer :
- producer
- A queue is the name for the post box in RabbitMQ. Although messages flow through RabbitMQ and your applications, they can only be stored inside a queue.
- queue
- A queue is only bound by the host's memory & disk limits, it's essentially a large message buffer.
- Consuming has a similar meaning to receiving. A consumer is a program that mostly waits to receive messages:


# RabbitMQ tutorial - Work Queues — RabbitMQ

### Metadata
- Title: RabbitMQ tutorial - Work Queues — RabbitMQ
- URL: https://www.rabbitmq.com/tutorials/tutorial-two-javascript.html
### Highlights & Notes

- Work Queues
- The main idea behind Work Queues (aka: Task Queues) is to avoid doing a resource-intensive task immediately and having to wait for it to complete. Instead we schedule the task to be done later. We encapsulate a task as a message and send it to a queue. A worker process running in the background will pop the tasks and eventually execute the job. When you run many workers the tasks will be shared between them.
- Round-robin dispatching
- One of the advantages of using a Task Queue is the ability to easily parallelise work.
- By default, RabbitMQ will send each message to the next consumer, in sequence.
- On average every consumer will get the same number of messages. This way of distributing messages is called round-robin.
- Message acknowledgment
- Doing a task can take a few seconds, you may wonder what happens if a consumer starts a long task and it terminates before it completes.
- With our current code, once RabbitMQ delivers a message to the consumer, it immediately marks it for deletion.
- In this case, if you terminate a worker, you lose the message it was just processing. The messages that were dispatched to this particular worker but were not yet handled are also lost.
- But we don't want to lose any tasks. If a worker dies, we'd like the task to be delivered to another worker.
- RabbitMQ supports message acknowledgments. An ack(nowledgement) is sent back by the consumer to tell RabbitMQ that a particular message has been received, processed and that RabbitMQ is free to delete it.
- If a consumer dies (its channel is closed, connection is closed, or TCP connection is lost) without sending an ack, RabbitMQ will understand that a message wasn't processed fully and will re-queue it.
- A timeout (30 minutes by default) is enforced on consumer delivery acknowledgement.
- You can increase this timeout as described in Delivery Acknowledgement Timeout.
- Acknowledgement must be sent on the same channel that received the delivery. Attempts to acknowledge using a different channel will result in a channel-level protocol exception.
- Forgotten acknowledgment It's a common mistake to miss the ack. It's an easy error, but the consequences are serious. Messages will be redelivered when your client quits (which may look like random redelivery), but RabbitMQ will eat more and more memory as it won't be able to release any unacked messages.
- Message durability
- We have learned how to make sure that even if the consumer dies, the task isn't lost. But our tasks will still be lost if RabbitMQ server stops.
- When RabbitMQ quits or crashes it will forget the queues and messages unless you tell it not to. Two things are required to make sure that messages aren't lost: we need to mark both the queue and messages as durable.
- RabbitMQ doesn't allow you to redefine an existing queue with different parameters and will return an error to any program that tries to do that.
- This durable option change needs to be applied to both the producer and consumer code.
- we need to mark our messages as persistent - by using the persistent option Channel.sendToQueue takes.
- Note on message persistence
- Marking messages as persistent doesn't fully guarantee that a message won't be lost. Although it tells RabbitMQ to save the message to disk, there is still a short time window when RabbitMQ has accepted a message and hasn't saved it yet. Also, RabbitMQ doesn't do fsync(2) for every message -- it may be just saved to cache and not really written to the disk. The persistence guarantees aren't strong, but it's more than enough for our simple task queue. I
- Fair dispatch
- You might have noticed that the dispatching still doesn't work exactly as we want. For example in a situation with two workers, when all odd messages are heavy and even messages are light, one worker will be constantly busy and the other one will do hardly any work. Well, RabbitMQ doesn't know anything about that and will still dispatch messages evenly.
- This happens because RabbitMQ just dispatches a message when the message enters the queue. It doesn't look at the number of unacknowledged messages for a consumer. It just blindly dispatches every n-th message to the n-th consumer.
- In order to defeat that we can use the prefetch method with the value of 1. This tells RabbitMQ not to give more than one message to a worker at a time.
- Or, in other words, don't dispatch a new message to a worker until it has processed and acknowledged the previous one. Instead, it will dispatch it to the next worker that is not still busy.
- Note about queue size
- If all the workers are busy, your queue can fill up. You will want to keep an eye on that, and maybe add more workers, or have some other strategy.


# RabbitMQ tutorial - Publish/Subscribe — RabbitMQ
### Metadata
- Title: RabbitMQ tutorial - Publish/Subscribe — RabbitMQ
- URL: https://www.rabbitmq.com/tutorials/tutorial-three-javascript.html
### Highlights & Notes

- The assumption behind a work queue is that each task is delivered to exactly one worker. In this part we'll do something completely different -- we'll deliver a message to multiple consumers. This pattern is known as "publish/subscribe".
- A producer is a user application that sends messages. A queue is a buffer that stores messages. A consumer is a user application that receives messages.
- The core idea in the messaging model in RabbitMQ is that the producer never sends any messages directly to a queue. Actually, quite often the producer doesn't even know if a message will be delivered to any queue at all.
- Instead, the producer can only send messages to an exchange.
- An exchange is a very simple thing. On one side it receives messages from producers and the other side it pushes them to queues.
- The exchange must know exactly what to do with a message it receives. Should it be appended to a particular queue? Should it be appended to many queues? Or should it get discarded. The rules for that are defined by the exchange type.
- There are a few exchange types available: `direct, topic, headers and fanout`.
- The fanout exchange is very simple. As you can probably guess from the name, it just broadcasts all the messages it receives to all the queues it knows.
- Listing exchanges
- To list the exchanges on the server you can run the ever useful rabbitmqctl:  `sudo rabbitmqctl list_exchanges`
- In this list there will be some amq.* exchanges and the default (unnamed) exchange. These are created by default, but it is unlikely you'll need to use them at the moment.
- The default exchange
- In previous parts of the tutorial we knew nothing about exchanges, but still were able to send messages to queues. That was possible because we were using a default exchange, which is identified by the empty string ("").
- `channel.sendToQueue('hello', Buffer.from('Hello World!'));` Here we use the default or nameless exchange: messages are routed to the queue with the name specified as first parameter, if it exists.
- Now, we can publish to our named exchange instead:  
  - `channel.publish('logs', '', Buffer.from('Hello World!'));` 
  - The empty string as second parameter means that we don't want to send the message to any specific queue. We want only to publish it to our 'logs' exchange.
- Temporary queues
- Giving a queue a name is important when you want to share the queue between producers and consumers.
- We want to hear about all log messages, not just a subset of them.
- We're also interested only in currently flowing messages not in the old ones. To solve that we need two things.
- Firstly, whenever we connect to Rabbit we need a fresh, empty queue. To do this we could create a queue with a random name, or, even better - let the server choose a random queue name for us.
- Secondly, once we disconnect the consumer the queue should be automatically deleted.
- In the amqp.node client, when we supply queue name as an empty string, we create a non-durable queue with a generated name:  
`channel.assertQueue('', {   exclusive: true });`
- When the method returns, the queue instance contains a random queue name generated by RabbitMQ. For example it may look like `amq.gen-JzTY20BRgKO-HjmUJj0wLg`.
- When the connection that declared it closes, the queue will be deleted because it is declared as exclusive.
- Bindings
- We've already created a fanout exchange and a queue. Now we need to tell the exchange to send messages to our queue. That relationship between exchange and a queue is called a binding.  
`channel.bindQueue(queue_name, 'logs', '');`
- Listing bindings
- You can list existing bindings using, you guessed it,  `rabbitmqctl list_bindings`
- publishing to a non-existing exchange is forbidden.
- The messages will be lost if no queue is bound to the exchange yet, but that's okay for us; if no consumer is listening yet we can safely discard the message.


# RabbitMQ tutorial - Topics — RabbitMQ
### Metadata
- Title: RabbitMQ tutorial - Topics — RabbitMQ
- URL: https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html
### Highlights & Notes
- In the previous tutorial we improved our logging system. Instead of using a fanout exchange only capable of dummy broadcasting, we used a direct one, and gained a possibility of selectively receiving the logs.
-  subscribe to not only logs based on severity, but also based on the source which emitted the log.
- this concept from the syslog unix tool, which routes logs based on both severity (info/warn/crit...) and facility (auth/cron/kern...).
- Messages sent to a topic exchange can't have an arbitrary routing_key - it must be a list of words, delimited by dots. The words can be anything, but usually they specify some features connected to the message.
- The binding key must also be in the same form.
- `*` (star) can substitute for exactly one word. `#` (hash) can substitute for zero or more words.
- send messages which all describe animals. The messages will be sent with a routing key that consists of three words (two dots). The first word in the routing key will describe speed, second a colour and third a species: `"<speed>.<colour>.<species>"`.
- What happens if we break our contract and send a message with one or four words, like "orange" or "quick.orange.new.rabbit"? Well, these messages won't match any bindings and will be lost.
- Topic exchange
- opic exchange is powerful and can behave like other exchanges.  When a queue is bound with `"#"` (hash) binding key - it will receive all the messages, regardless of the routing key - like in fanout exchange.  When special characters `"*"` (star) and `"#"` (hash) aren't used in bindings, the topic exchange will behave just like a direct one.

# RabbitMQ tutorial - Remote procedure call (RPC) — RabbitMQ
### Metadata
- Title: RabbitMQ tutorial - Remote procedure call (RPC) — RabbitMQ
- URL: https://www.rabbitmq.com/tutorials/tutorial-six-javascript.html
### Highlights & Notes

- A note on RPC
- Although RPC is a pretty common pattern in computing, it's often criticised. The problems arise when a programmer is not aware whether a function call is local or if it's a slow RPC. Confusions like that result in an unpredictable system and adds unnecessary complexity to debugging. Instead of simplifying software, misused RPC can result in unmaintainable spaghetti code.
- Bearing that in mind, consider the following advice:  Make sure it's obvious which function call is local and which is remote. Document your system. Make the dependencies between components clear. Handle error cases. How should the client react when the RPC server is down for a long time?
- When in doubt avoid RPC. If you can, you should use an asynchronous pipeline - instead of RPC-like blocking, results are asynchronously pushed to a next computation stage
#### Callback queue
- A client sends a request message and a server replies with a response message. In order to receive a response we need to send a 'callback' queue address with the request.
- `persistent`: Marks a message as persistent
- `content_type`: Used to describe the mime-type of the encoding.
-  `application/json`.
- `reply_to`: Commonly used to name a callback queue.
- `correlation_id`: Useful to correlate RPC responses with requests.
#### Correlation Id
- We're going to set it to a unique value for every request. Later, when we receive a message in the callback queue we'll look at this property, and based on that we'll be able to match a response with a request. If we see an unknown correlation_id value, we may safely discard the message - it doesn't belong to our requests.
- the restarted RPC server will process the request again. That's why on the client we must handle the duplicate responses gracefully, and the RPC should ideally be idempotent.
- If the RPC server is too slow, you can scale up by just running another one. Try running a second rpc_server.js in a new console
- On the client side, the RPC requires sending and receiving only one message. As a result the RPC client needs only one network round trip for a single RPC request.
- more complex (but important) problems, like:  How should the client react if there are no servers running? Should a client have some kind of timeout for the RPC? If the server malfunctions and raises an exception, should it be forwarded to the client? Protecting against invalid incoming messages (eg checking bounds, type) before processing.

# Streams
- https://www.rabbitmq.com/streams.html
- https://github.com/amqp-node/amqplib/blob/main/examples/stream_queues/README.md

