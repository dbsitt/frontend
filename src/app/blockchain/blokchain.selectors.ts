import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BlockchainState } from './blockchain.reducers';
import { find } from 'lodash';

export const blockchainState = createFeatureSelector<BlockchainState>(
  'blockchain'
);

export const getTransactions = createSelector(
  blockchainState,
  (state: BlockchainState) => state.transactions
);

export const getSelected = createSelector(
  blockchainState,
  (state: BlockchainState) => find(state.transactions, ['id', state.selected])
);
