import { createReducer, on } from '@ngrx/store';
import { setLoading } from './ui.actions';

export interface UiState {
  isLoading: boolean;
}

const initialState: UiState = {
  isLoading: false,
};

export const uiReducer = createReducer(
  initialState,
  on(setLoading, (state, props) => ({
    ...state,
    isLoading: props.value,
  }))
);
