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
import { USERNAMES } from './blockchain/blockchain.constants';

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

  isLoading$: Observable<boolean>;

  USERNAMES = USERNAMES;

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  get currentUserRole() {
    return this.helperService.getCurrentUserRole();
  }

  get userId() {
    return this.helperService.getCurrentUserId();
  }

  ngOnInit(): void {
    this.isLoading$ = this.uiStore.pipe(select(getIsLoading));
  }

  logout() {
    this.helperService.setUser(null);
  }
}
