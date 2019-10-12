import { createAction, props } from '@ngrx/store';

export enum UserAction {
  setUser = '[User] Set User',
}

export const setUser = createAction(
  UserAction.setUser,
  props<{ user: string }>()
);
