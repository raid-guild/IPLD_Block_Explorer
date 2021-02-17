import { rlp } from "ethereumjs-util";
import { ethers } from "ethers";
//import { erc20TransferEvent , erc721TransferEvent, ensTransferEvent} from "./events.abi";

//abiDecoder.addABI(erc20TransferEvent);
export const decodeTx = (raw_tx: String) => {
  const buffer = Buffer.from(raw_tx.replace("\\x", ""), "hex");
  const decoded_tx: any = rlp.decode(buffer); // eslint-disable-line
  console.log(decoded_tx);
  var [raw_nonce, raw_gasPrice, raw_gasLimit, raw_to, raw_value, raw_data, raw_v, raw_r, raw_s] = decoded_tx;

  var transaction = {
    nonce: raw_nonce.toString("hex"),
    gasPrice: raw_gasPrice.toString("hex"),
    gasLimit: raw_gasLimit.toString("hex"),
    to: raw_to.toString("hex"),
    value: raw_value.toString("hex"),
    data: raw_data.toString("hex"),
    v: raw_v.toString("hex"),
    r: raw_r.toString("hex"),
    s: raw_s.toString("hex"),
  };

  console.log(transaction);

  if (transaction.to == "0x") delete transaction.to;

  return transaction;
};

//TODO: EVENT DECODING FOR ETHVM EVENT TYPES
// const abiDecoder = require("abi-decoder");
// abiDecoder.addABI(erc20TransferEvent);
// abiDecoder.addABI(erc721TransferEvent);
// abiDecoder.addABI(ensTransferEvent);

// export const decodeLogs = (logs){
//   const decodedLogs = abiDecoder.decodeLogs(receipt.logs);
//   return decodedLogs;
// }

// MIT License

// Copyright (c) 2017 Gregory F J Hogue

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
