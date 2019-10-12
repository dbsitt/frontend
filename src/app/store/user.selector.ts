import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.reducers';

export const userState = createFeatureSelector<UserState>('user');

export const getCurrentUser = createSelector(
  userState,
  (state: UserState) => state.user
);
