import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { UserState } from './store/user.reducers';
import { setUser } from './store/user.actions';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Account } from './store/user';
import { UiState } from './store/ui.reducer';
import { getIsLoading } from './store/ui.selector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private userStore: Store<UserState>,
    private uiStore: Store<UiState>
  ) {}

  userIdChanged$: Subject<string> = new Subject<string>();

  isLoading$: Observable<boolean>;

  userId = '';

  ngOnInit(): void {
    this.isLoading$ = this.uiStore.pipe(select(getIsLoading));
    this.userIdChanged$
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(model => {
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
    const { value } = event.target;
    this.userId = value;
    this.userIdChanged$.next(value);
  }
}
