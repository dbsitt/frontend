import { createReducer, on, MetaReducer } from '@ngrx/store';
import { loginSuccessful, logoutSuccessful } from './auth.actions';
import { storeFreeze } from 'ngrx-store-freeze';
import { environment } from 'src/environments/environment.hmr';

export interface AuthState {
  userToken: string;
}

const initialAuthState: AuthState = {
  userToken: undefined,
};

export const authReducer = createReducer(
  initialAuthState,
  on(loginSuccessful, (state, props) => ({
    ...state,
    userToken: props.userToken,
  })),
  on(logoutSuccessful, () => ({
    userToken: null,
  }))
);
