import { createAction, props } from '@ngrx/store';
import { Transaction } from './blockchain';

export enum BlockchainAction {
  fetchAllStarted = '[BLockchain] Fetch All Started',
  fetchAllSuccessful = '[Blockchain] Fetch All Successful',
  setSelected = '[Blockchain Set Selected',
}

export const fetchAllStarted = createAction(BlockchainAction.fetchAllStarted);

export const fetchAllSuccessful = createAction(
  BlockchainAction.fetchAllSuccessful,
  props<{ transactions: Transaction[] }>()
);

export const setSelected = createAction(
  BlockchainAction.setSelected,
  props<{ id: string }>()
);
