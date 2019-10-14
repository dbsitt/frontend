import { Component, OnInit, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BlockTrade } from '../blockchain';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { UserState } from 'src/app/store/user.reducers';
import { Account } from 'src/app/store/user';
import { getCurrentUser } from 'src/app/store/user.selector';
import {
  filter,
  finalize,
  distinct,
  distinctUntilChanged,
} from 'rxjs/operators';
import { UiState } from 'src/app/store/ui.reducer';
import { setLoading } from 'src/app/store/ui.actions';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-block-trade',
  templateUrl: './block-trade.component.html',
  styleUrls: ['./block-trade.component.scss'],
})
export class BlockTradeComponent implements OnInit {
  file: any;

  content: BlockTrade;

  executionStates: any[];

  currentUser$: Observable<Account>;
  currentUserId: string;

  executionStates$: Observable<any>;

  constructor(
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
    private userStore: Store<UserState>,
    private uiStore: Store<UiState>
  ) {}

  ngOnInit() {
    this.currentUser$ = this.userStore.pipe(select(getCurrentUser));
    this.currentUser$.pipe(distinctUntilChanged()).subscribe(user => {
      if (user !== null) {
        this.currentUserId = user.id;
      } else {
        this.currentUserId = null;
      }
    });
  }

  get isVisible() {
    return this.currentUserId === 'Broker1' || this.currentUserId === 'Client1';
  }

  get hasExecutionAccess() {
    return this.currentUserId === 'Broker1';
  }

  fileChanged(e) {
    const fileReader = new FileReader();
    if (e.target.files.length > 0) {
      this.file = e.target.files[0];
      fileReader.onload = (res: any) => {
        try {
          const str = res.target.result.toString();

          const parsed: BlockTrade = JSON.parse(str);

          this.content = parsed;
        } catch (error) {
          this.snackBar.open('File cannot be parsed to json', 'Close', {
            duration: 2000,
          });
        }
      };

      fileReader.readAsText(this.file);
    }
  }

  onSubmit() {
    if (this.content) {
      if (this.currentUserId === 'Broker1') {
        this.uiStore.dispatch(setLoading({ value: true }));
        this.httpClient
          .post(environment.brokerApi + '/execution', this.content)
          .pipe(
            finalize(() => {
              this.uiStore.dispatch(setLoading({ value: false }));
            })
          )
          .subscribe(res => {
            console.log('DO SOMETHING', res);
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
