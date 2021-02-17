import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import ReceiptCids from "./receiptCids";
import HeaderCids from "./headerCids";

@Index("transaction_cids_header_id_tx_hash_key", ["headerId", "txHash"], {
  unique: true,
})
@Index("transaction_cids_pkey", ["id"], { unique: true })
@Entity("transaction_cids", { schema: "eth" })
export default class TransactionCids {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "header_id", unique: true })
  headerId: number;

  @Column("varying character", { name: "tx_hash", unique: true, length: 66 })
  txHash: string;

  @Column("integer", { name: "index" })
  index: number;

  @Column("text", { name: "cid" })
  cid: string;

  @Column("text", { name: "mh_key" })
  mhKey: string;

  @Column("varying character", { name: "dst", length: 66 })
  dst: string;

  @Column("varying character", { name: "src", length: 66 })
  src: string;

  @Column("varying character", { name: "nonce", length: 66 })
  nonce: string;

  @Column("varying character", { name: "gasPrice", length: 66 })
  gasPrice: string;

  @Column("varying character", { name: "gasLimit", length: 66 })
  gasLimit: string;

  @Column("varying character", { name: "value", length: 66 })
  value: string;

  @Column("varying character", { name: "data", length: 66 })
  data: string;

  @Column("varying character", { name: "v", length: 66 })
  v: string;

  @Column("varying character", { name: "r", length: 66 })
  r: string;

  @Column("varying character", { name: "s", length: 66 })
  s: string;

  @Column("blob", { name: "tx_data", nullable: true })
  txData: Buffer | null;

  @OneToOne(() => ReceiptCids, (receiptCids) => receiptCids.tx)
  receiptCids: ReceiptCids;

  @ManyToOne(() => HeaderCids, (headerCids) => headerCids.transactionCids, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "header_id", referencedColumnName: "id" }])
  header: HeaderCids;
}
