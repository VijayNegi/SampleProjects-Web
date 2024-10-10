//const { kafka } = require("./client.js");
const ip = require('ip')
const { Kafka, CompressionTypes, logLevel } = require('kafkajs')
const host = process.env.HOST_IP || ip.address()

const kafka = new Kafka({
  //logLevel: logLevel.DEBUG,
  brokers: ['localhost:9092'],  // localhost  '${host}:9092'
  clientId: 'example-producer',
})


async function init() {
    const admin = kafka.admin();
    console.log("Admin connecting...");
    console.log("Host: " + host);
    await admin.connect();
    console.log("Admin Connection Success...");

    console.log("Creating Topic [rider-updates]");
    //await admin.listTopics()

    await admin.createTopics({
    topics: [
        {
        topic: "rider-updates",
        numPartitions: 1,
        },
    ],
    });
    console.log("Topic Created Success [rider-updates]");

    console.log("Disconnecting Admin..");
    await admin.disconnect();
    }

    init();
