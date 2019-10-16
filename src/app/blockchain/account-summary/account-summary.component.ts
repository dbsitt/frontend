import { Component, OnInit } from '@angular/core';
import { BlockchainState } from '../blockchain.reducers';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { getCurrentUser } from 'src/app/store/user.selector';
import { Account } from 'src/app/store/user';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { UiState } from '../../store/ui.reducer';
import { UserState } from '../../store/user.reducers';
import { HelperService } from '../helperService';
import { finalize, filter } from 'rxjs/operators';
import { setLoading } from 'src/app/store/ui.actions';
import { interval } from 'rxjs/internal/observable/interval';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-account-summary',
  templateUrl: './account-summary.component.html',
  styleUrls: ['./account-summary.component.scss'],
})
export class AccountSummaryComponent implements OnInit {
  data: any = null;
  account$: Observable<Account>;
  tableData = [];
  columns = [
    'walletRef',
    'accountNumber',
    'accountName',
    'currency',
    'amount',
    'holder',
  ];

  constructor(
    private store: Store<BlockchainState>,
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
    private uiStore: Store<UiState>,
    private userStore: Store<UserState>,
    private helperService: HelperService
  ) {}

  get displayedColumns() {
    return [
      'holder',
      'walletRef',
      'accountNumber',
      'accountName',
      'currency',
      'amount',
    ];
  }
  get currentUserRole() {
    return this.helperService.getCurrentUserRole();
  }
  fetchAccountSummary() {
    this.columns = [
      'holder',
      'walletRef',
      'accountNumber',
      'accountName',
      'currency',
      'amount',
    ];
    if (
      this.currentUserRole === 'CLIENT' ||
      this.currentUserRole === 'BROKER'
    ) {
      let test = this.columns.filter(function(item) {
        return item !== 'holder';
      });

      this.columns = test;
    }

    this.uiStore.dispatch(setLoading({ value: true }));
    this.httpClient
      //.get(this.helperService.getBaseUrl() + '/getAccounts')

      .get('http://localhost:4000/getAccounts')
      .pipe(
        finalize(() => {
          this.uiStore.dispatch(setLoading({ value: false }));
        })
      )
      .subscribe(
        (response: any) => {
          if (response !== null) {
            this.tableData = response;
          }
        },
        () => {
          this.data = null;
          this.snackBar.open(
            'Error occur when fetching account summary',
            'Close',
            {
              duration: 2000,
            }
          );
        }
      );
  }
  ngOnInit() {
    this.account$ = this.store.pipe(select(getCurrentUser));
    // this.fetchAccountSummary();
    this.helperService.currentUser$.subscribe(e => {
      console.log('calling fetch account summary');
      this.fetchAccountSummary();
    });

    // interval(4000)
    // .pipe(
    //   startWith(0),
    //   switchMap(() => this.httpClient.get('http://3.1.246.227:10050/api/getAccounts'))
    // )
    // .subscribe(
    //   (response: any) => {
    //     if (response !== null) {
    //       this.tableData = response;
    //     }
    //   },
    //   () => {
    //     this.data = null;
    //     this.snackBar.open(
    //       'Error occur when fetching execution-states',
    //       'Close',
    //       {
    //         duration: 2000,
    //       }
    //     );
    //   }
    // );
  }
}
