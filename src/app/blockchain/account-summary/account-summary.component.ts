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
            this.tableData = [];
            for (let i = 0; i < response.length; i++) {
              //  let productIdentifier = '';
              let source = '';
              //let productName = '';
              //if(response[i].portfolio.aggregationParameters.product && response[i].portfolio.aggregationParameters.product.length > 0){
              let bond =
                response[i].portfolio.aggregationParameters.product &&
                response[i].portfolio.portfolioState.positions[0].product
                  .security.bond;
              let productIdentifier =
                response[i].portfolio.portfolioState.positions[0].product &&
                response[i].portfolio.portfolioState.positions[0].product
                  .security.bond.productIdentifier;
              let productName = productIdentifier.identifier[0].value;
              if (productIdentifier && productIdentifier.source) {
                source = productIdentifier.source;
              }

              let party = response[i].portfolio.aggregationParameters.party[0];
              let acc = party.value;
              let accountName = acc.account.accountName.value;
              let accountNumber = acc.account.accountNumber.value;
              let holder = party.value.name.value;

              let quantity = '';
              let currency = '';
              let amount = '';
              let positionStatus = '';
              if (
                response[i].portfolio.portfolioState.positions &&
                response[i].portfolio.portfolioState.positions.length > 0
              ) {
                let position =
                  response[i].portfolio.portfolioState.positions[0];
                if (position.cashBalance) {
                  quantity = position.cashBalance.amount;
                  currency = position.cashBalance.currency.value;
                }
                amount = position.quantity.amount;
                positionStatus = position.positionStatus || positionStatus;
              }

              const _account = new Object();

              _account['source'] = source;
              _account['productName'] = productName;
              _account['accountName'] = accountName;
              _account['accountNumber'] = accountNumber;
              _account['quantity'] = quantity;
              _account['currency'] = currency;
              _account['amount'] = amount;
              _account['positionStatus'] = positionStatus;
              _account['holder'] = holder;

              this.tableData.push(_account);

              console.log(this.tableData);
            }
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
