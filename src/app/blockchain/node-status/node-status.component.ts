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
  selector: 'app-node-status',
  templateUrl: './node-status.component.html',
  styleUrls: ['./node-status.component.scss'],
})
export class NodeStatusComponent implements OnInit {
  public accounts: AccountBalance[];
  public cacheAccounts: AccountBalance[];
  public summaries: any[];

  data: any = null;
  account$: Observable<Account>;
  tableData = [];

  constructor(
    private store: Store<BlockchainState>,
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
    private uiStore: Store<UiState>,
    private userStore: Store<UserState>,
    private helperService: HelperService
  ) {}

  get displayedColumns() {
    return ['walletRef', 'accountNumber', 'accountName', 'currency', 'amount'];
  }

  filterAccountBalance(filterVal: any) {
    if (filterVal == '0') this.accounts = this.cacheAccounts;
    else
      this.accounts = this.cacheAccounts.filter(
        item => item.amount > filterVal
      );
  }

  fetchAccountSummary() {
    this.uiStore.dispatch(setLoading({ value: true }));
    this.httpClient
      //.get(this.helperService.getBaseUrl() + '/getAccounts')
      //.get('http://3.1.246.227:10050/api/getAccounts')
      .get('http://localhost:4000/getAccounts')

      .pipe(
        finalize(() => {
          this.uiStore.dispatch(setLoading({ value: false }));
        })
      )
      .subscribe(
        (response: any) => {
          if (response !== null) {
            this.accounts = response as AccountBalance[];
            this.cacheAccounts = this.accounts;
            console.log(this.accounts);

            this.tableData = response;
          }
        },
        () => {
          this.data = null;
          this.snackBar.open(
            'Error occur when fetching execution-states',
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

    // this.helperService.currentUser$.subscribe(e => {
    //   console.log("calling fetch account summary")
    this.fetchAccountSummary();
    // });
  }
}

interface AccountBalance {
  walletRef: string;
  accountNumber: string;
  currency: string;
  accountName: string;
  amount: string;
}

interface Summary {
  name: string;
}
