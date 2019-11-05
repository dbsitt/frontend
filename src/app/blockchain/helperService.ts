import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { UserState } from '../store/user.reducers';
import { getCurrentUser } from '../store/user.selector';
import { map, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Account } from '../store/user';
import { UiState } from '../store/ui.reducer';
import { HttpClient } from '@angular/common/http';
import { setLoading } from '../store/ui.actions';
import { MatSnackBar } from '@angular/material';
import { USERNAMES, ROLES } from './blockchain.constants';
import { setUser } from '../store/user.actions';

@Injectable()
export class HelperService {
  currentUser$: Observable<Account>;

  constructor(
    private snackBar: MatSnackBar,
    private userStore: Store<UserState>,
    private uiStore: Store<UiState>,
    private httpClient: HttpClient
  ) {
    this.currentUser$ = this.userStore.pipe(select(getCurrentUser));
  }

  getBaseUrl(): string {
    let url = '';
    this.currentUser$
      .pipe(
        map(user => {
          if (user.id === USERNAMES.BROKER1) {
            return environment.brokerApi;
          } else if (user.id === USERNAMES.BROKER2) {
            return environment.broker2Api;
          } else if (user.id === USERNAMES.CLIENT1) {
            return environment.clientApi1;
          } else if (user.id === USERNAMES.CLIENT2) {
            return environment.clientApi2;
          } else if (user.id === USERNAMES.CLIENT3) {
            return environment.clientApi3;
          } else if (user.id === USERNAMES.OBSERVER1) {
            return environment.obseverApi1;
          } else if (user.id === USERNAMES.SETTLEMENT_AGENT1) {
            return environment.settlementAgentAPi1;
          } else if (user.id === USERNAMES.COLLATERAL_AGENT1) {
            return environment.collateralAgentApi1;
          } else {
            throw Error('should not come to this point');
          }
        })
      )
      .subscribe(res => {
        url = res;
      });
    return url;
  }

  getCurrentUserId(): string {
    let user: string = null;
    this.currentUser$.subscribe(res => {
      if (res) {
        user = res.id;
      } else {
        user = null;
      }
    });
    return user;
  }

  getCurrentUserRole(): string {
    let role: string = null;
    this.currentUser$.subscribe(res => {
      if (res) {
        role = res.role;
      } else {
        role = null;
      }
    });
    return role;
  }

  postJson(
    content: any,
    hasActionAccess: string[],
    endpoint: string,
    callback?: (a: any) => void
  ) {
    if (content) {
      if (hasActionAccess.includes(this.getCurrentUserId())) {
        this.uiStore.dispatch(setLoading({ value: true }));
        this.httpClient
          .post(this.getBaseUrl() + endpoint, content, { responseType: 'text' })
          .pipe(
            finalize(() => {
              this.uiStore.dispatch(setLoading({ value: false }));
            })
          )
          .subscribe(res => {
            if (callback) {
              callback(res);
            }
            this.snackBar.open(res, 'Close', {
              duration: 2000,
            });
          });
      } else {
        this.snackBar.open('Behavior not allowed for this user', 'Close', {
          duration: 2000,
        });
      }
    } else {
      this.snackBar.open('Please select a file first', 'Close', {
        duration: 2000,
      });
    }
  }

  setUser(username: string): Account {
    if (username === USERNAMES.BROKER1 || username === USERNAMES.BROKER2) {
      // TODO change to api call
      const user: Account = {
        id: username,
        cashAccount: 123,
        securityHolding: '12345',
        role: ROLES.BROKER,
      };
      this.userStore.dispatch(setUser({ user }));
      return user;
    } else if (
      username === USERNAMES.CLIENT1 ||
      username === USERNAMES.CLIENT2 ||
      username === USERNAMES.CLIENT3
    ) {
      const user: Account = {
        id: username,
        cashAccount: 123,
        securityHolding: '12345',
        role: ROLES.CLIENT,
      };

      this.userStore.dispatch(setUser({ user }));
      return user;
    } else if (username === USERNAMES.SETTLEMENT_AGENT1) {
      const user: Account = {
        id: username,
        cashAccount: 456,
        securityHolding: '12345',
        role: ROLES.SETTLEMENT_AGENT,
      };

      this.userStore.dispatch(setUser({ user }));
      return user;
    } else if (username === USERNAMES.OBSERVER1) {
      const user: Account = {
        id: username,
        cashAccount: 456,
        securityHolding: '12345',
        role: ROLES.OBSERVER,
      };

      this.userStore.dispatch(setUser({ user }));
      return user;
    } else if (username === USERNAMES.COLLATERAL_AGENT1) {
      const user: Account = {
        id: username,
        cashAccount: 456,
        securityHolding: '12345',
        role: ROLES.COLLATERAL_AGENT,
      };

      this.userStore.dispatch(setUser({ user }));
      return user;
    } else {
      this.userStore.dispatch(setUser({ user: null }));
      if (!username) {
        this.snackBar.open('Successfully Logout', 'Close', {
          duration: 1000,
        });
      } else {
        this.snackBar.open('User not found', 'Close', {
          duration: 2000,
        });
      }
      return null;
    }
  }
}
