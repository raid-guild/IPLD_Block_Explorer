import { ConnectionOptions, createConnection, getConnection } from "typeorm";
import * as ws from "ws";
import { Mutex } from "async-mutex";
import GraphqlService from "./services/graphqlService";
import DataService from "./services/dataService";
import GraphqlClient from "./graphqlClient";
import { BlockProcessor, TransactionProcessor, EventProcessor, IDataStream } from "./dataProcessor";

const start = async () => {
  //TODO: add option to use local storage on browser, file is easier to test with for now.
  const config: ConnectionOptions = {
    type: "sqljs",
    location: "./test.rld",
    autoSave: true,
    useLocalForage: true,
    entities: ["src/models/*.ts", "src/models/**/*.ts"],
    logging: true,
    synchronize: false, //NOTE: broken on sql.js (open issue) causes foreign key constraints to fail on migrations
    migrations: ["src/migrations/*.ts"],
    cli: {
      entitiesDir: "src/models",
      migrationsDir: "src/migrations",
    },
  };
  //NOTE: createConnection hook adds connection to globally available context, can be fetched with getConnection()
  await createConnection(config).then(() => {
    console.log("Connected to sql.js @" + config.location);
  });

  //TODO: refactor to createEthIndexerClient, hoist up the config
  const graphqlClient = new GraphqlClient("http://localhost:5000", ws);
  //TODO: refactor to ethIndexerService, hoist up the config, move to its own package
  const dataProducer = new GraphqlService(graphqlClient);
  //TODO: refactor to dataProcessorService, push decode into process step for ETHVM event types and rlp transactions, kill rest of dead code
  const dataConsumer = new DataService();

  //NOTE: NEED A MUTEX SQL.js client only has one write thread which blocks and throws, queue the processing of different data streams and wait for lock to release to continue
  const mutex = new Mutex();

  let headerStream: IDataStream = new BlockProcessor(mutex);
  headerStream.addSource(dataProducer);
  headerStream.addSink(dataConsumer);
  headerStream.start();

  let transactionStream: IDataStream = new TransactionProcessor(mutex);
  transactionStream.addSource(dataProducer);
  transactionStream.addSink(dataConsumer);
  transactionStream.start();

  let eventStream: IDataStream = new EventProcessor(mutex);
  eventStream.addSource(dataProducer);
  eventStream.addSink(dataConsumer);
  eventStream.start();

  console.log("test");
  const conn = getConnection();
  conn.query("SELECT * FROM transaction_cids").then((data) => console.log(data));
};

start();
