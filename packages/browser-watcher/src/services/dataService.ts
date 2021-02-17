import { getConnection } from "typeorm";
import { MutexInterface } from "async-mutex";
import HeaderCids from "../models/eth/headerCids";
import TransactionCids from "../models/eth/transactionCids";
import TransactionCidsRepository from "../repositories/eth/transactionCidsRepository";
import HeaderCidsRepository from "../repositories/eth/headerCidsRepository";
import ReceiptCidsRepository from "../repositories/eth/receiptCidsRepository";
import ReceiptCids from "models/eth/receiptCids";
import { decodeTx } from "../utils";
// import {decodeLogs} from "../utils";

export default class DataService {
  public async processReceipt(
    relatedNode: {
      cid;
      txId;
      mhKey;
      contract;
      contractHash;
      topic0s;
      topic1s;
      topic2s;
      topic3s;
      logContracts;
    },
    mutex: MutexInterface
  ): Promise<ReceiptCids> {
    if (!relatedNode) {
      return;
    }

    //TODO: debug decode and add fields back to table
    //const decodedLogs = decodeLogs([topic0s,topic1s,topic2s,topic3s ])

    await mutex.runExclusive(async () => {
      return getConnection().transaction(async (entityManager) => {
        const receiptCidsRepository: ReceiptCidsRepository = entityManager.getCustomRepository(ReceiptCidsRepository);
        const receipt = await receiptCidsRepository.add(relatedNode);

        return receipt;
      });
    });
  }

  public async processTransaction(
    relatedNode: {
      cid;
      dst;
      headerId;
      index;
      mhKey;
      nodeId;
      src;
      txData;
      txHash;
      ethHeaderCidByHeaderId: {
        id;
        timestamp;
      };
      receiptCidByTxId: {
        id;
      };
      blockByMhKey: {
        data;
      };
    },
    mutex: MutexInterface
  ): Promise<TransactionCids> {
    if (!relatedNode) {
      return;
    }
    //TODO: Decode input arguments once track contracts but prefferably fetch from contract watcher
    const { nonce, gasPrice, gasLimit, to, value, data, v, r, s } = decodeTx(relatedNode.blockByMhKey.data);
    var decodedData = {
      ...relatedNode,
      nonce,
      gasPrice,
      gasLimit,
      to,
      value,
      data,
      v,
      r,
      s,
    };

    await mutex.runExclusive(async () => {
      return getConnection().transaction(async (entityManager) => {
        const transactionCidsRepository: TransactionCidsRepository = entityManager.getCustomRepository(
          TransactionCidsRepository
        );
        const transaction = await transactionCidsRepository.add(decodedData);

        return transaction;
      });
    });
  }

  public async processHeader(
    relatedNode: {
      td;
      blockHash;
      blockNumber;
      bloom;
      cid;
      mhKey;
      nodeId;
      ethNodeId;
      parentHash;
      receiptRoot;
      uncleRoot;
      stateRoot;
      txRoot;
      reward;
      timesValidated;
      timestamp;
    },
    mutex: MutexInterface
  ): Promise<HeaderCids> {
    if (!relatedNode) {
      return;
    }
    //TODO: augment block data
    await mutex.runExclusive(async () => {
      return getConnection().transaction(async (entityManager) => {
        const headerCidsRepository: HeaderCidsRepository = entityManager.getCustomRepository(HeaderCidsRepository);
        const header = await headerCidsRepository.add(relatedNode);

        return header;
      });
    });
  }
}
