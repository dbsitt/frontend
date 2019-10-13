import { createAction, props } from '@ngrx/store';
import { Account } from './user';

export enum UserAction {
  setUser = '[User] Set User',
}

export const setUser = createAction(
  UserAction.setUser,
  props<{ user: Account }>()
);
