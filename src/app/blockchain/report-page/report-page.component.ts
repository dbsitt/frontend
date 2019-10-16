import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
  selector: 'app-report-page',
  templateUrl: './report-page.component.html',
  styleUrls: ['./report-page.component.scss'],
})
export class ReportPageComponent implements OnInit {
  file: any = null;
  content: any = null;

  public accounts: AccountBalance[];
  public cacheAccounts: AccountBalance[];
  public summaries: any[];

  data: any = null;
  tableData = [];
  account$: Observable<Account>;

  constructor(
    private store: Store<BlockchainState>,
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
    private uiStore: Store<UiState>,
    private userStore: Store<UserState>,
    private helperService: HelperService
  ) {}

  ngOnInit() {
    this.account$ = this.store.pipe(select(getCurrentUser));
    // this.fetchAccountSummary();

    // this.helperService.currentUser$.subscribe(e => {
    //   console.log("calling fetch account summary")
    this.fetchAccountSummary();
    this.helperService.currentUser$.subscribe(() => {
      this.resetData();
    });
  }

  resetData() {
    this.file = null;
    this.content = null;
    (document.getElementsByClassName('file-chooser')[0] as any).value = '';
  }

  get currentUserRole() {
    return this.helperService.getCurrentUserRole();
  }

  get currentUserId() {
    return this.helperService.getCurrentUserId();
  }

  fileChanged(e) {
    const fileReader = new FileReader();
    if (e.target.files.length > 0) {
      this.file = e.target.files[0];
      fileReader.onload = (res: any) => {
        try {
          const str = res.target.result.toString();

          const parsed: any = JSON.parse(str);

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

  onSubmit(url) {
    const callback = () => {
      this.resetData();
    };

    // this.helperService.postJson(
    //   this.content,
    //   [this.currentUserId],
    //   `/${url}`,
    //   callback.bind(this)
    // );
  }

  get displayedColumns() {
    return [
      'clientId',
      'partyId',
      'productId',
      'productName',
      'productSource',
      'quantityAmount',
      'cashBalanceAmount',
      'currency',
      'positionStatus',
      'transactionId',
      'eventId',
      'executionId',
      'eventId',
      'dateTime',
    ];
  }

  filterAccountBalance(filterVal: any) {
    let test = [];
    if (filterVal == '0') this.accounts = this.cacheAccounts;
    else {
      for (var i = 0; i < this.cacheAccounts.length; i++) {
        if (this.cacheAccounts[i].clientId === filterVal) {
          test.push(this.cacheAccounts[i]);
        }
        console.log(this.cacheAccounts[i]);
        //Do something
      }

      this.accounts = test;
      // let aa = this.cacheAccounts.filter(
      //   item => item.clientId === filterVal
      // );
      // console.log(aa);
      //this.accounts = aa;
      // alert(filterVal)
    }
  }

  fetchAccountSummary() {
    this.uiStore.dispatch(setLoading({ value: true }));
    this.httpClient
      //.get(this.helperService.getBaseUrl() + '/getAccounts')
      //.get('http://3.1.246.227:10050/api/getAccounts')
      .get('http://localhost:4000/getReports')

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
}

interface AccountBalance {
  clientId: string;
  partyId: string;
  dateTime: string;
  productName: string;
  productId: string;
  productSource: string;
  quantityAmount: string;
  cashBalanceAmount: string;
  currency: string;
  positionStatus: string;
  transactionId: string;
  eventId: string;
  executionId: string;
}

interface Summary {
  name: string;
}
