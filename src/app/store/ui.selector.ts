import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UiState } from './ui.reducer';

export const uiState = createFeatureSelector<UiState>('ui');

export const getIsLoading = createSelector(
  uiState,
  (state: UiState) => state.isLoading
);
