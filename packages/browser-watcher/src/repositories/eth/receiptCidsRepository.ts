import { EntityRepository, Repository } from "typeorm";
import ReceiptCids from "../../models/eth/receiptCids";

@EntityRepository(ReceiptCids)
export default class ReceiptCidsRepository extends Repository<ReceiptCids> {
  public async add({
    cid,
    txId,
    mhKey,
    contract,
    contractHash,
    topic0s,
    topic1s,
    topic2s,
    topic3s,
    logContracts,
  }): Promise<ReceiptCids> {
    return this.save({
      cid,
      txId,
      mhKey,
      contract,
      contractHash,
      topic0s,
      topic1s,
      topic2s,
      topic3s,
      logContracts,
    });
  }
}
