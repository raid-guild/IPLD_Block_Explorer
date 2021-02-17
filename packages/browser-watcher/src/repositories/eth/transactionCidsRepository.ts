import { EntityRepository, Repository } from "typeorm";
import TransactionCids from "../../models/eth/transactionCids";

@EntityRepository(TransactionCids)
export default class TransactionCidsRepository extends Repository<TransactionCids> {
  public async add({
    headerId,
    cid,
    index,
    mhKey,
    dst,
    src,
    txData,
    txHash,
    ethHeaderCidByHeaderId,
    receiptCidByTxId,
    blockByMhKey,
    nonce,
    gasPrice,
    gasLimit,
    to,
    value,
    data,
    v,
    r,
    s,
  }): Promise<TransactionCids> {
    return this.save({
      cid,
      headerId,
      index,
      mhKey,
      dst,
      src,
      txData,
      txHash,
      nonce,
      gasPrice,
      gasLimit,
      value,
      data,
      v,
      r,
      s,
      header: ethHeaderCidByHeaderId,
      receiptCids: receiptCidByTxId,
    });
  }
}
