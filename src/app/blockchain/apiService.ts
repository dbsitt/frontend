import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { UserState } from '../store/user.reducers';
import { getCurrentUser } from '../store/user.selector';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable()
export class ApiService {
  constructor(private userStore: Store<UserState>) {}

  getBaseUrl() {
    let url = '';
    this.userStore
      .pipe(
        select(getCurrentUser),
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
}
