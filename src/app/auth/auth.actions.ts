import { createAction, props } from '@ngrx/store';

export enum AuthAction {
  loginStarted = '[Auth] Login Started',
  loginSuccessful = '[Auth] Login Started',
  logoutStarted = '[Auth] Login Started',
  logoutSuccessful = '[Auth] Login Started',
}

export const loginStarted = createAction(
  AuthAction.loginStarted,
  props<{ user: string; password: string }>()
);

export const loginSuccessful = createAction(
  AuthAction.loginSuccessful,
  props<{ userToken: string }>()
);

export const logoutStarted = createAction(AuthAction.logoutStarted);

export const logoutSuccessful = createAction(AuthAction.logoutSuccessful);
