import GraphqlClient from '../graphqlClient';
import GraphqlRepository from '../repositories/graphqlRepository';

export default class GraphqlService {
	private graphqlRepository: GraphqlRepository;

	constructor (graphqlClient: GraphqlClient) {
		this.graphqlRepository = GraphqlRepository.getRepository(graphqlClient);
	}

	public async subscriptionReceiptCids(func: (value: any) => void): Promise<void> {
		return this.graphqlRepository.subscriptionReceiptCids(func, (error) => {console.log(error)});
	}

	public async subscriptionHeaderCids(func: (value: any) => void): Promise<void> {
		return this.graphqlRepository.subscriptionHeaderCids(func, (error) => {console.log(error)});
	}

	public async subscriptionTransactionCids(func: (value: any) => void): Promise<void> {
		return this.graphqlRepository.subscriptionTransactionCids(func, (error) => {console.log(error)});
	}

}
