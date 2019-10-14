import { Transaction } from './blockchain';
import { createReducer, on, MetaReducer } from '@ngrx/store';
import { fetchAllSuccessful, setSelected } from './blockchain.actions';
import { environment } from 'src/environments/environment';

export interface BlockchainState {
  transactions: Transaction[];
  confirmation: string;
  allocation: string;
  affirmation: string;
  selected: string;
}

const initialBlockchainState: BlockchainState = {
  transactions: [],
  confirmation: null,
  allocation: null,
  affirmation: null,
  selected: null,
};

export const blockchainReducer = createReducer(
  initialBlockchainState,
  on(fetchAllSuccessful, (state, props) => ({
    ...state,
    transactions: props.transactions,
  })),
  on(setSelected, (state, props) => ({
    ...state,
    selected: props.id,
  }))
);

export const metaReducers: MetaReducer<
  BlockchainState
>[] = !environment.production ? [] : [];
