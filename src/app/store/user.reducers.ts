import { createReducer, on, Action } from '@ngrx/store';
import { setUser } from './user.actions';
import { Account } from './user';

export interface UserState {
  currentUser: Account;
}

const initialState: UserState = {
  currentUser: null,
};

const reducer = createReducer(
  initialState,
  on(setUser, (state, props) => ({
    ...state,
    currentUser: props.user,
  }))
);

export function userReducer(state: UserState | undefined, action: Action) {
  return reducer(state, action);
}

