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
import { USERNAMES } from './blockchain.constants';

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
      user = res.id;
    });
    return user;
  }

  getCurrentUserRole(): string {
    let role: string = null;
    this.currentUser$.subscribe(res => {
      role = res.role;
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
}
