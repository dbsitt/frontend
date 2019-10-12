import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { UserState } from './store/user.reducers';
import { setUser } from './store/user.actions';
import { getCurrentUser } from './store/user.selector';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private userStore: Store<UserState>) {}

  currentUser$: Observable<string>;

  ngOnInit(): void {
    this.currentUser$ = this.userStore.pipe(select(getCurrentUser));
  }

  onKeyup(event) {
    const { value } = event.target;
    if (value) {
      this.userStore.dispatch(setUser({ user: event.target.value }));
    }
  }
}
