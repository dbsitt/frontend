import { Component, OnInit, OnDestroy } from '@angular/core';
import { BlockchainState } from '../blockchain.reducers';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { getCurrentUser } from 'src/app/store/user.selector';
import { Account } from 'src/app/store/user';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { UiState } from '../../store/ui.reducer';
import { HelperService } from '../helperService';
import { finalize } from 'rxjs/operators';
import { setLoading } from 'src/app/store/ui.actions';

@Component({
  selector: 'app-account-summary',
  templateUrl: './account-summary.component.html',
  styleUrls: ['./account-summary.component.scss'],
})
export class AccountSummaryComponent implements OnInit, OnDestroy {
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

  accountSummarySubscription$: any;
  currentUserSubscription$: any;

  constructor(
    private store: Store<BlockchainState>,
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
    private uiStore: Store<UiState>,
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

    this.accountSummarySubscription$ = this.httpClient
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

  ngOnDestroy(): void {
    this.accountSummarySubscription$.unsubscribe();
    this.currentUserSubscription$.unsubscribe();
  }

  ngOnInit() {
    this.account$ = this.store.pipe(select(getCurrentUser));
    this.currentUserSubscription$ = this.helperService.currentUser$.subscribe(
      e => {
        this.fetchAccountSummary();
      }
    );
  }
}
