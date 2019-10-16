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
      'accountName',
      'accountNumber',
      'productName',
      'source',
      'quantity',
      'currency',
      'amount',
      'positionStatus',
    ];
  }

  get currentUserRole() {
    return this.helperService.getCurrentUserRole();
  }
  fetchAccountSummary() {
    this.columns = [
      'holder',
      'accountName',
      'accountNumber',
      'productName',
      'source',
      'quantity',
      'currency',
      'amount',
      'positionStatus',
    ];
    this.uiStore.dispatch(setLoading({ value: true }));
    this.httpClient
      .get(this.helperService.getBaseUrl() + '/portfolio')
      .pipe(
        finalize(() => {
          this.uiStore.dispatch(setLoading({ value: false }));
        })
      )
      .subscribe(
        (response: any) => {
          if (response !== null) {
            for (let i = 0; i < response.length; i++) {
              let productIdentifier =
                response[i].portfolio.aggregationParameters.product[0].security
                  .bond.productIdentifier;
              let source = productIdentifier.source;
              let productName = productIdentifier.identifier[0].value;
              let party = response[i].portfolio.aggregationParameters.party[0];
              let acc = party.value;
              let accountName = acc.account.accountName.value;
              let accountNumber = acc.account.accountNumber.value;
              let holder = party.value.name.value;

              let position = response[i].portfolio.portfolioState.positions[0];
              let quantity = position.cashBalance.amount;
              let currency = position.cashBalance.currency.value;

              let amount = position.quantity.amount;
              let positionStatus = position.positionStatus;

              console.log('source: ' + source);
              console.log(productName);
              console.log(accountName);
              console.log(accountNumber);
              console.log(quantity);
              console.log(currency);
              console.log(amount);
              console.log(positionStatus);

              // alert(response[i].portfolio.product[0].security.bond.productIdentifier.identifier)
              console.log(response[i]);
              var _account = new Object();
              _account['source'] = source;
              _account['productName'] = productName;
              _account['accountName'] = accountName;
              _account['accountNumber'] = accountNumber;
              _account['quantity'] = quantity;
              _account['currency'] = currency;
              _account['amount'] = amount;
              _account['positionStatus'] = positionStatus;
              _account['holder'] = holder;

              console.log(_account);

              this.tableData.push(_account);
            }

            //this.tableData = response;
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
    this.helperService.currentUser$.subscribe(e => {
      console.log('calling fetch account summary');

      //_account.

      // accountHolder: string;
      // accountName: string;
      // accountNumber: string;
      // product: string;
      // source: string;
      // quantity: string;
      // currency: string;
      // amount: string;
      // positionStatus: string;

      //)
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
// interface AccountDetail {
//   accountHolder: string;
//   accountName: string;
//   accountNumber: string;
//   product: string;
//   source: string;
//   quantity: string;
//   currency: string;
//   amount: string;
//   positionStatus: string;
// }
