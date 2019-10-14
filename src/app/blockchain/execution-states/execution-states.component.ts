import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, filter } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { UiState } from 'src/app/store/ui.reducer';
import { setLoading } from 'src/app/store/ui.actions';
import { MatSnackBar } from '@angular/material';
import { UserState } from 'src/app/store/user.reducers';
import { getCurrentUser } from 'src/app/store/user.selector';
import { HelperService } from '../helperService';
import { ExecutionState } from '../blockchain';

@Component({
  selector: 'app-execution-states',
  templateUrl: './execution-states.component.html',
  styleUrls: ['./execution-states.component.scss'],
})
export class ExecutionStatesComponent implements OnInit {
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
    private userStore: Store<UserState>,
    private apiService: HelperService
  ) {}

  ngOnInit() {
    this.fetchExecutionStates();

    this.userStore
      .pipe(select(getCurrentUser))
      .pipe(filter(user => user !== null))
      .subscribe(() => {
        this.fetchExecutionStates();
      });
  }

  fetchExecutionStates() {
    this.uiStore.dispatch(setLoading({ value: true }));
    this.httpClient
      .get(this.apiService.getBaseUrl() + '/execution-states')
      .pipe(
        finalize(() => {
          this.uiStore.dispatch(setLoading({ value: false }));
        })
      )
      .subscribe(
        (response: any) => {
          if (response !== null) {
            this.data = response;

            const filterFunction = this.allocationFilter.bind(this);
            if (this.type === 'affirm') {
            }

            this.tableData = this.mapExecutions(response).filter(
              filterFunction
            );
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

  allocationFilter(exec) {
    return exec.type.toLowerCase() === this.type.toLowerCase();
  }

  mapExecutions(executions: any[]): any[] {
    return executions.map(exec => {
      let status: string;

      const { closedState, meta } = exec.execution;

      const isBlock = meta.globalKey === meta.externalKey;

      const type = isBlock ? 'Block' : 'Allocation';

      if (isBlock) {
        if (closedState) {
          status = closedState.state;
        } else {
          status = '-';
        }
      } else {
        status = exec.status;
      }

      return {
        status,
        type,
        id: exec.execution.meta.globalKey,
        underlying: this.getProductForRecord(exec),
      };
    });
  }

  isActionEnabled(execution: ExecutionState): boolean {
    if (this.type === 'allocation') {
      return execution.status === 'UNAFFIRMED';
    }
    return true;
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
