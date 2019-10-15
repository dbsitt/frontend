import {
  Component,
  OnInit,
  AfterContentChecked,
  ChangeDetectorRef,
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { UserState } from './store/user.reducers';
import { setUser } from './store/user.actions';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Account } from './store/user';
import { UiState } from './store/ui.reducer';
import { getIsLoading } from './store/ui.selector';
import { MatSnackBar } from '@angular/material';
import { HelperService } from './blockchain/helperService';
import { ROLES } from './blockchain/blockchain.constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterContentChecked {
  constructor(
    private userStore: Store<UserState>,
    private uiStore: Store<UiState>,
    private snackBar: MatSnackBar,
    private helperService: HelperService,
    private changeDetector: ChangeDetectorRef
  ) {}

  userIdChanged$: Subject<string> = new Subject<string>();

  isLoading$: Observable<boolean>;

  userId = 'Broker1';

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  get currentUserRole() {
    return this.helperService.getCurrentUserRole();
  }

  ngOnInit(): void {
    this.isLoading$ = this.uiStore.pipe(select(getIsLoading));
    this.userIdChanged$
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.userId = value;
        this.setUser();
      });

    // Default
    this.setUser();
  }

  onUserChange(event) {
    const { value } = event.target;
    this.userIdChanged$.next(value);
  }

  setUser() {
    const username = this.userId;
    if (username === 'Broker1' || username === 'Broker2') {
      // TODO change to api call
      const user: Account = {
        id: username,
        cashAccount: 123,
        securityHolding: '12345',
        role: ROLES.BROKER,
      };
      this.userStore.dispatch(setUser({ user }));
      this.userId = username;
    } else if (
      username === 'Client1' ||
      username === 'Client2' ||
      username === 'Client3'
    ) {
      const user: Account = {
        id: username,
        cashAccount: 123,
        securityHolding: '12345',
        role: ROLES.CLIENT,
      };

      this.userStore.dispatch(setUser({ user }));
      this.userId = username;
    } else if (username === 'SA1') {
      const user: Account = {
        id: username,
        cashAccount: 456,
        securityHolding: '12345',
        role: ROLES.SETTLEMENT_AGENT,
      };

      this.userStore.dispatch(setUser({ user }));
      this.userId = username;
    } else if (username === 'Observer') {
      const user: Account = {
        id: username,
        cashAccount: 456,
        securityHolding: '12345',
        role: ROLES.OBSERVER,
      };

      this.userStore.dispatch(setUser({ user }));
      this.userId = username;
    } else {
      this.userStore.dispatch(setUser({ user: null }));
      this.snackBar.open('User not found', 'Close', {
        duration: 2000,
      });
    }
  }
}
