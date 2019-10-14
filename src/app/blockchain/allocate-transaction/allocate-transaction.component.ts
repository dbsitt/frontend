import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { UserState } from 'src/app/store/user.reducers';
import { getCurrentUser } from 'src/app/store/user.selector';
import { Account } from 'src/app/store/user';
import { filter, finalize, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UiState } from 'src/app/store/ui.reducer';
import { HttpClient } from '@angular/common/http';
import { setLoading } from 'src/app/store/ui.actions';

@Component({
  selector: 'app-allocate-transaction',
  templateUrl: './allocate-transaction.component.html',
  styleUrls: ['./allocate-transaction.component.scss'],
})
export class AllocateTransactionComponent implements OnInit {
  file: any;
  content: any;

  currentUser$: Observable<Account>;
  currentUser: string = null;

  allocateResponse$: Observable<any>;

  constructor(
    private snackBar: MatSnackBar,
    private userStore: Store<UserState>,
    private uiStore: Store<UiState>,
    private httpClient: HttpClient
  ) {}

  ngOnInit() {
    this.currentUser$ = this.userStore.pipe(select(getCurrentUser));
    this.currentUser$.pipe(filter(user => user !== null)).subscribe(user => {
      this.currentUser = user.id;
    });
  }

  fileChanged(e) {
    const fileReader = new FileReader();
    if (e.target.files.length > 0) {
      this.file = e.target.files[0];
      fileReader.onload = (res: any) => {
        const str = res.target.result.toString();

        const parsed = JSON.parse(str);

        this.content = parsed;
      };

      fileReader.readAsText(this.file);
    }
  }

  onSubmit() {
    if (this.content) {
      if (this.currentUser === 'Broker1') {
        this.uiStore.dispatch(setLoading({ value: true }));
        this.allocateResponse$ = this.httpClient
          .get(environment.brokerApi + '/allocation')
          .pipe(
            finalize(() => {
              this.uiStore.dispatch(setLoading({ value: false }));
            })
          );
      } else {
        this.snackBar.open(
          'Only Broker1 is allowed for this actions',
          'Close',
          {
            duration: 4000,
          }
        );
      }
    } else {
      this.snackBar.open('Please select a file first', 'Close', {
        duration: 2000,
      });
    }
  }
}
