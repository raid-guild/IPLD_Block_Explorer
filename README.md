# Browser Watcher

## High level
The ETHVM block explorer front end uses queries exposed by a graphql server that indexes block data. ETH VM does this using Apollo client bindings generated from their graphql server schema(see **schema-goal.json**). We would like to accomplish the following:


(0) Sync Block data using eth-watcher CID indexed data exposed via postgraphile endpoint to a SQL.js database (this should be able to run in the browser or as an independent process).
(1) Generate a corresponding gql server that exposes congruent graphql queries for ETHVM, but is generated using graphql-mesh/tuql from a sql.js data base schema. This would allow us to just change the endpoint the ETHVM front-end is querying 
(2) Generate a corresponding browser API that exposes data directly from SQL.js, congruent with the graphql queries for ETHVM. This would require us to replace all the GQL queries in the ETHVM frontend with our Browser API. 

(0) + (1) is the least amount of work for the most usefulness so we'll do that first. 

We know the graphql api definition, and response types required by ETHVM, since much of our bindings are generated, it behooves us to define the sqlite schema carefully. 

Ideally we can define the sqlite schema so that **tuql** will automatically define models and associations, tha will require minimal changes in graphql queries for the block explorer work right out of the box.

## Low level


Imagine the block explorer requires a query that looked something like this:

```graphql
{
  posts {
    title
    body
    user {
      username
    }
    categories {
      title
    }
  }
}
```
**tuql** works one of two ways. It prefers to map your schema based on the foreign key information in your tables. If foreign keys are not present, **tuql** assumes the following about your schema in order to map relationships:

1. The primary key column is named `id` or `thing_id` or `thingId`, where `thing` is the singular form of the table name. Example: For a table named **posts**, the primary key column should be named `id`, `post_id` or `postId`.
2. Similarly, foreign key columns should be `thing_id` or `thingId`, where `thing` is the singular form of the associated table.
3. For many-to-many associations, the table name should be in the form of `foo_bar` or `bar_foo` (ordering is not important). The columns should follow the same pattern as #2 above.

Following these rules we can deduce the shape of the underlying sql.js table would need to be as follows:

| posts | users | categories | category_post |
| :-: | :-: | :-: | :-: |
| id      | id | id | category_id |
| user_id | username | title | post_id |
| title   | | |
| body    | | |



## Specification 

We will focus on implementing Block and Transaction query definitions, based on the generated API types/schema used by the ETHVM gql client. The graphql API we need to satify (**schema-goal.json**) implies the following sql schema (with the addition of CIDs so that data can be cached on IPFS and used to rehydrate stores later) 

| Blocks          | Uncles           | Txs             |
| :-:             | :-:              | :-:             |
| id              | id               | id              | 
| Cid             | Cid              | Cid             | 
| hash            | parentHash       | blockHash       |
| parentHash      | parentBlockNumber| blockNumber     |
| nonce           | unclePosition    | from            |
| sha3Uncles      | blockId          | gas             |
| logsBloom       |                  | gasPrice        |
| transactionsRoot|                  | timestamp       |
| stateRoot       |                  | gasUsed         |
| receiptsRoot    |                  | hash            |
| difficulty      |                  | status          |
| totalDifficulty |                  | input           |
| extraData       |                  | nonce           |
| size            |                  | to              |
| gasLimit        |                  | transactionIndex|
| gasUsed         |                  | value           |
| transactions[]  |                  | replacedBy      |
| number          |                  | v               |
| miner           |                  | r               |
| txCount         |                  | s               |
| timestamp       |                  | blockId         |
| uncles          |                  |                 |
| txFail          |                  |                 |
| base            |                  |                 |
| uncles[]        |                  |                 |
| txFees          |                  |                 |
| total           |                  |                 |

Relations (using typeorm): 
```
@Entity({ name: "blocks" })
export class Block {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;
  ...
  @OneToMany((type) => Uncle, (uncle) => uncle.block)
  uncles: Uncles[];
  @OneToMany((type) => Transaction, (transaction) => transaction.block)
  transactions: Transactions[];
```

```
@Entity({ name: "uncles" })
export class Uncle {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;
  ...
  @ManyToOne((type) => Block, (block) => block.uncles, { onDelete: "CASCADE" }))
  @JoinColumn([{ name: "block_id", referencedColumnName: "id" }])
  block: Block;
```

```
@Entity({ name: "Transactions" })
export class Transaction {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;
  ...
  @ManyToOne((type) => Block, (block) => block.transactions, { onDelete: "CASCADE" }))
  block: Block;
```

## Diagrams

#### (0) + (1): 
(0) Sync Block data using eth-watcher CID index exposed via postgraphile endpoint to a SQL.js database (this should be able to run in the browser or as an independent process).
(1) Generate a corresponding gql server that exposes congruent graphql queries for ETHVM, but is generated using graphql-mesh/tuql from a sql.js data base schema. This would allow us to just change the endpoint the ETHVM front-end is querying
```
    +--------+                  +------------+
    |        |                  |            |
    |GQL     |  +------------+  |ETH CIDs    |
    |API     |--+postgraphile+--|Endpoint    |
    |        |  +------------+  |(EthWatcher)|
    +---+----+                  +------------+
        :  
-----------------------------------------------------
        |   Sync/Subscribe to ETH CIDs     
        V                         
    +--------+                  +------------+
    |        |                  |            |
    |Data    |   +---------+    |DB          |
    |Repos.  |---+ TYPEORM +----|Schema      |
    |        |   +---------+    |(EthVM)     |
    +---+----+                  +------------+
        :                         
        |      Generate/Update DB     
        V                         
    +--------+                  +------------+
    |        |                  |            |
    |SQLite  |   +---------+    |Database    |
    |DB      |---+ SQL.js  +----|client side |
    |        |   +---------+    |            |
    +---+----+                  +------------+
        :   
-----------------------------------------------------
        |    Expose SQLite via GQL  
        V       
    +--------+                  +------------+
    |        |                  |            |
    |SQLite  |   +---------+    |            |
    |GraphQL |---+  tuql   +----|graphql-mesh|
    |API     |   +---------+    |transform   |
    |        |                  |            |
    +---+----+                  +------------+
        :                         
        |  Implement ETHVM queries/resolvers         
        V  
    +--------+                  +------------+
    |        |                  |            |
    |GQL     |  +------------+  |ETHVM       |
    |API     |--+graphql-mesh+--|Endpoint    |
    |        |  +------------+  |            |
    +---+----+                  +------------+
        ^                         
        |    Serve queries to ETHVM    
        :  
    +--------+                  +------------+
    |        |                  |            |
    |GQL     |  +------------+  |ETHVM       |
    |Query   |--+apolloClient+--|Block       |
    |        |  +------------+  |Explorer    |
    +---+----+                  +------------+

```

#### (0) + (2)
(0) Sync Block data using eth-watcher CID indexed data exposed via postgraphile endpoint to a SQL.js database (this should be able to run in the browser or as an independent process).
(2) Generate a corresponding browser API that exposes data directly from SQL.js, congruent with the graphql queries for ETHVM. This would require us to replace all the GQL queries in the ETHVM frontend with our Browser API. 

```
    +--------+                  +------------+
    |        |                  |            |
    |GQL     |  +------------+  |ETH CIDs    |
    |API     |--+postgraphile+--|Endpoint    |
    |        |  +------------+  |(EthWatcher)|
    +---+----+                  +------------+
        :    
-----------------------------------------------------
        |   Sync/Subscribe to ETH CIDs     
        V                         
    +--------+                  +------------+
    |        |                  |            |
    |Data    |   +---------+    |DB          |
    |Repos.  |---+ TYPEORM +----|Schema      |
    |        |   +---------+    |(EthVM)     |
    +---+----+                  +------------+
        :                         
        |     Generate/Update DB    
        V                         
    +--------+                  +------------+
    |        |                  |            |
    |SQLite  |   +---------+    |Database    |
    |DB      |---+ SQL.js  +----|(Browser)   |
    |        |   +---------+    |            |
    +---+----+                  +------------+
        ^   
        |    Expose SQLite via SDK  
        :       
    +--------+                  +------------+
    |        |                  |            |
    |SQLite  |   +---------+    |            |
    |query   |---+ETHVM-SDK+----|TypeScript  |
    |bindings|   +---------+    |Browser SDK |
    |        |                  |            |
    +---+----+                  +------------+
        ^                         
        |  Replace ETHVM queries with SDK       
        :  
    +--------+                  +-------------+
    |        |                  |             |
    |SDK     |  +------------+  |ETHVM        |
    |Query   |--+ vueContext +--|BlockExplorer|
    |        |  +------------+  |(fork)       |
    +---+----+                  +-------------+

```