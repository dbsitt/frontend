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
          if (user.id === 'Broker1') {
            return environment.brokerApi;
          } else if (user.id === 'Broker2') {
            return environment.broker2Api;
          } else if (user.id === 'Client1') {
            return environment.clientApi1;
          } else if (user.id === 'Client2') {
            return environment.clientApi2;
          } else if (user.id === 'Client3') {
            return environment.clientApi3;
          } else if (user.id === 'Observer') {
            return environment.obseverApi;
          } else if (user.id === 'SA1') {
            return environment.settlementAgentAPi;
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
          .post(this.getBaseUrl() + endpoint, content)
          .pipe(
            finalize(() => {
              this.uiStore.dispatch(setLoading({ value: false }));
            })
          )
          .subscribe(res => {
            if (callback) {
              callback(res);
            }
            this.snackBar.open('Succesfully uploaded', 'Close', {
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
