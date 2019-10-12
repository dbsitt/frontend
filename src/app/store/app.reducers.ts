import { MetaReducer, ActionReducerMap } from '@ngrx/store';
import { routerReducer } from '@ngrx/router-store';
import { environment } from 'src/environments/environment.hmr';
import { storeFreeze } from 'ngrx-store-freeze';
import { uiReducer } from './ui.reducer';
import { userReducer } from './user.reducers';

// tslint:disable-next-line: no-empty-interface
export interface AppState {}

export const reducers: ActionReducerMap<AppState> = {
  router: routerReducer,
  ui: uiReducer,
  user: userReducer,
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? [storeFreeze]
  : [];
