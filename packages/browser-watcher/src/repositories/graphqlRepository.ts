import GraphqlClient from "../graphqlClient";

export default class GraphqlRepository {
  private static repository: GraphqlRepository;

  private graphqlClient: GraphqlClient;

  public static getRepository(graphqlClient: GraphqlClient): GraphqlRepository {
    if (!GraphqlRepository.repository) {
      GraphqlRepository.repository = new GraphqlRepository(graphqlClient);
    }

    return GraphqlRepository.repository;
  }

  public constructor(graphqlClient: GraphqlClient) {
    this.graphqlClient = graphqlClient;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public subscriptionReceiptCids(onNext: (value: any) => void, onError: (error: any) => void): Promise<void> {
    console.log("subscribe");
    return this.graphqlClient.subscribe(
      `
	  subscription MySubscription {
		listen(topic: "receipt_cids") {
		  relatedNode {
			... on ReceiptCid {
			  id
			  cid
			  contract
			  contractHash
			  logContracts
			  mhKey
			  topic0S
			  topic1S
			  topic2S
			  topic3S
			  ethTransactionCidByTxId {
				id
			  }
			  txId
			}
		  }
		}
	  }
	  
		`,
      onNext,
      onError
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public subscriptionHeaderCids(onNext: (value: any) => void, onError: (error: any) => void): Promise<void> {
    return this.graphqlClient.subscribe(
      `
			subscription MySubscription {
				listen(topic: "header_cids") {
					relatedNode {
					... on EthHeaderCid {
						id
						td
						blockHash
						blockNumber
						bloom
						cid
						mhKey
						nodeId
						ethNodeId
						parentHash
						receiptRoot
						reward
						timesValidated
						timestamp
						txRoot
						uncleRoot
						stateRoot
					}
					}
				}
			}
		`,
      onNext,
      onError
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public subscriptionTransactionCids(onNext: (value: any) => void, onError: (error: any) => void): Promise<void> {
    return this.graphqlClient.subscribe(
      `
		subscription MySubscription {
			listen(topic: "transaction_cids") {
			relatedNode {
				... on EthTransactionCid {
				id
				cid
				dst
				headerId
				index
				mhKey
				nodeId
				src
				txData
				txHash
				ethHeaderCidByHeaderId {
					blockHash
					cid
					id
					timestamp
					txRoot
				}
				receiptCidByTxId {
					contract
					contractHash
					cid
					id
					logContracts
				}
				blockByMhKey {
					data
				}
				}
			}
			}
		}
		`,
      onNext,
      onError
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public subscriptionStateCids(onNext: (value: any) => void, onError?: (error: any) => void): Promise<void> {
    return this.graphqlClient.subscribe(
      `
			subscription MySubscription {
				listen(topic: "state_cids") {
					relatedNode {
					... on StateCid {
						id
						blockByMhKey {
							data
							key
						}
						stateLeafKey
						statePath
						mhKey
						headerId
						storageCidsByStateId {
							nodes {
								storageLeafKey
								storagePath
								mhKey
								id
								stateId
								blockByMhKey {
									data
									key
								}
							}
						}
						ethHeaderCidByHeaderId {
							blockNumber
						}
					}
					}
				}
			}
		`,
      onNext,
      onError
    );
  }
}
