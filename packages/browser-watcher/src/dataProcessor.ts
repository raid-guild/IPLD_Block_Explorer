import { MutexInterface} from 'async-mutex';
//NOTE: Keep DI pattern and blackbox old code
export interface IDataStreamFactory {
    new (mutex:MutexInterface): IDataStream;
  }
  
export interface IDataStream {
    //TODO: I know this is ugly, need to refactor the gqlClient and dataService to get rid of all the any types but *didn't want to break* the current API
    source: any;
    sink: any;

    addSource(source: any):void;
    addSink(sink: any):void;
    start():any;
    stop():any;
  }
  
  export const BlockProcessor: IDataStreamFactory = class BlockProcessor implements IDataStream{
    //TODO: finish types
    source:any;
    sink:any;
    mutex:MutexInterface
    
    constructor(_mutex:MutexInterface) {
      this.mutex = _mutex;
    }

    addSource(_source: any){
        this.source= _source;
    };
    addSink(_sink: any){
        this.sink= _sink
    };
    start() {
        this.source.subscriptionHeaderCids((data:any) => this.sink.processHeader(data?.data?.listen?.relatedNode, this.mutex));
    }
    stop(){
      console.log("Header Sync Stopped")
    }
  };


  export const TransactionProcessor: IDataStreamFactory = class TransactionProcessor implements IDataStream{
    //TODO: finish types
    source:any;
    sink:any;
    mutex:MutexInterface
    constructor(_mutex:MutexInterface) {
      this.mutex = _mutex;
    }

    addSource(_source: any){
        this.source= _source;
    };
    addSink(_sink: any){
        this.sink= _sink
    };
    start() {
        this.source.subscriptionTransactionCids((data:any) => this.sink.processTransaction(data?.data?.listen?.relatedNode, this.mutex));
    }
    stop(){
      console.log("Transaction Sync Stopped")
    }
  };

  export const EventProcessor: IDataStreamFactory = class EventProcessor implements IDataStream{
    //TODO: finish types
    source:any;
    sink:any;
    mutex:MutexInterface
    constructor(_mutex:MutexInterface) {
      this.mutex = _mutex;
    }

    addSource(_source: any){
        this.source= _source;
    };
    addSink(_sink: any){
        this.sink= _sink
    };
    start() {
        this.source.subscriptionReceiptCids((data:any) => this.sink.processReceipt(data?.data?.listen?.relatedNode, this.mutex));
    }
    stop(){
      console.log("Event Sync Stopped")
    }
  };

  







