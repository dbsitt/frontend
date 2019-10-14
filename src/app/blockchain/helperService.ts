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
          if (user.role === 'BROKER') {
            return environment.brokerApi;
          } else if (user.role === 'CLIENT') {
            return environment.clientApi;
          }
        })
      )
      .subscribe(res => {
        url = res;
      });

    console.log(url);
    return url;
  }

  getCurrentUserId(): string {
    let user: string = null;
    this.currentUser$.subscribe(res => {
      user = res.id;
    });
    return user;
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
          .post(environment.brokerApi + endpoint, content)
          .pipe(
            finalize(() => {
              this.uiStore.dispatch(setLoading({ value: false }));
            })
          )
          .subscribe(res => {
            if (callback) {
              callback(res);
            }
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
