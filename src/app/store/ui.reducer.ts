import { createReducer, on, Action } from '@ngrx/store';
import { setLoading } from './ui.actions';

export interface UiState {
  isLoading: boolean;
}

const initialState: UiState = {
  isLoading: false,
};

const reducer = createReducer(
  initialState,
  on(setLoading, (state, props) => ({
    ...state,
    isLoading: props.value,
  }))
);

export function uiReducer(state: UiState | undefined, action: Action) {
  return reducer(state, action);
}
