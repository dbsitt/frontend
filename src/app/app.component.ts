import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { UserState } from './store/user.reducers';
import { setUser } from './store/user.actions';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Account } from './store/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private userStore: Store<UserState>) {}

  userIdChanged: Subject<string> = new Subject<string>();

  userId: string;

  ngOnInit(): void {
    this.userIdChanged
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(model => {
        this.userId = model;
        if (model === 'Broker1') {
          // TODO change to api call
          const user: Account = {
            id: model,
            cashAccount: 123,
            securityHolding: '12345',
            role: 'BROKER',
          };
          this.userStore.dispatch(setUser({ user }));
        } else {
          this.userStore.dispatch(setUser({ user: null }));
        }
      });
  }

  onKeyup(event) {
    this.userIdChanged.next(event.target.value);
  }
}
