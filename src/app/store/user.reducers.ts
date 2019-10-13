import { createReducer, on } from '@ngrx/store';
import { setUser } from './user.actions';
import { Account } from './user';

export interface UserState {
  currentUser: Account;
}

const initialState: UserState = {
  currentUser: null,
};

export const userReducer = createReducer(
  initialState,
  on(setUser, (state, props) => ({
    ...state,
    currentUser: props.user,
  }))
);
