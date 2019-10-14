import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, finalize } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { UiState } from 'src/app/store/ui.reducer';
import { setLoading } from 'src/app/store/ui.actions';
import { MatSnackBar } from '@angular/material';
import { environment } from 'src/environments/environment';
import { UserState } from 'src/app/store/user.reducers';
import { getCurrentUser } from 'src/app/store/user.selector';

@Component({
  selector: 'app-execution-states',
  templateUrl: './execution-states.component.html',
  styleUrls: ['./execution-states.component.scss'],
})
export class ExecutionStatesComponent implements OnInit {
  rootHost = '';

  data: any = null;

  @Input() type: string;

  checkedExecutionList: string[] = [];

  tableData = [];

  get displayedColumns() {
    let columns = [];
    this.userStore.pipe(select(getCurrentUser)).subscribe(user => {
      if (user.role === 'BROKER') {
        columns = ['id', 'type', 'status', 'underlying'];
      } else if (user.role === 'CLIENT') {
        columns = ['id', 'type', 'status', 'underlying', 'action'];
      }
    });

    return columns;
  }

  constructor(
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
    private uiStore: Store<UiState>,
    private userStore: Store<UserState>
  ) {}

  ngOnInit() {
    if (this.type === 'Broker') {
      this.rootHost = environment.brokerApi;
    } else {
      this.rootHost = environment.clientApi;
    }
    this.uiStore.dispatch(setLoading({ value: true }));

    this.httpClient
      .get(this.rootHost + '/execution-states')
      .pipe(
        finalize(() => {
          this.uiStore.dispatch(setLoading({ value: false }));
        })
      )
      .subscribe(
        (e: any) => {
          if (e !== null) {
            this.data = e;

            this.tableData = e.map(ex => {
              let status: string;

              const { closedState, meta } = ex.execution;
              let type = closedState ? 'Closed' : 'Block';

              if (closedState) {
                status = closedState.state;
              } else if (meta.globalKey === meta.externalKey) {
                status = '-';
                type = 'Closed';
              } else {
                status = ex.status;
              }

              return {
                status,
                type,
                id: ex.execution.meta.globalKey,
                underlying: this.getProductForRecord(ex),
              };
            });
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

  performAction(e) {
    console.log(e);
  }

  getTradeDateForRecord(execution: any) {
    const { day, month, year } = execution.execution.tradeDate.value;

    return `${day}-${month}-${year}`;
  }

  getNetPriceForRecord(execution: any) {
    const { amount, currency } = execution.execution.price.netPrice;
    return `${amount}${currency.value}`;
  }

  getQuantityForRecord(execution: any) {
    const { amount } = execution.execution.quantity;
    return amount;
  }

  getSettlementAmountForRecord(execution: any) {
    const {
      amount,
      currency,
    } = execution.execution.settlementTerms.settlementAmount;

    return `${amount}${currency.value}`;
  }

  getSettlementDateForRecord(execution: any) {
    const {
      day,
      month,
      year,
    } = execution.execution.settlementTerms.settlementDate.adjustableDate.unadjustedDate;
    return `${day}-${month}-${year}`;
  }

  getProductForRecord(execution: any) {
    const {
      bond,
      convertibleBond,
      equity,
      exchangeTradedFund,
      mortgageBackedSecurity,
      mutualFund,
      warrant,
    } = execution.execution.product.security;
    if (bond) {
      return 'Bond';
    } else if (convertibleBond) {
      return 'Convertible Bond';
    } else if (equity) {
      return 'Equity';
    } else if (exchangeTradedFund) {
      return 'Exchange Traded Fund';
    } else if (mortgageBackedSecurity) {
      return 'Mortgage Backed Security';
    } else if (mutualFund) {
      return 'Mutual Fund';
    } else if (warrant) {
      return 'Warrant';
    }

    return 'No Product';
  }
}
