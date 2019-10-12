import { createAction, props } from '@ngrx/store';

export enum UiAction {
  setLoading = '[UI] Set Loading',
}

export const setLoading = createAction(
  UiAction.setLoading,
  props<{ value: boolean }>()
);
