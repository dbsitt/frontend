import { createReducer, on } from '@ngrx/store';
import { setUser } from './user.actions';

export interface UserState {
  user: string;
}

const initialState: UserState = {
  user: 'Broker1',
};

export const userReducer = createReducer(
  initialState,
  on(setUser, (state, props) => ({
    ...state,
    user: props.user,
  }))
);
