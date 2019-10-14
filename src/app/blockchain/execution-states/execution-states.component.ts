import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, finalize } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { UiState } from 'src/app/store/ui.reducer';
import { setLoading } from 'src/app/store/ui.actions';
import { MatSnackBar } from '@angular/material';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-execution-states',
  templateUrl: './execution-states.component.html',
  styleUrls: ['./execution-states.component.scss'],
})
export class ExecutionStatesComponent implements OnInit {
  rootHost = '';

  data: any = null;

  @Input() type: string;

  constructor(
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
    private uiStore: Store<UiState>
  ) {}

  ngOnInit() {
    if (this.type === 'Broker') {
      this.rootHost = environment.brokerApi;
    } else {
      this.rootHost = environment.clientApi;
    }

    this.httpClient
      .get(this.rootHost + '/execution-states')
      .pipe(
        tap(() => {
          this.uiStore.dispatch(setLoading({ value: true }));
        }),
        finalize(() => {
          this.uiStore.dispatch(setLoading({ value: false }));
        })
      )
      .subscribe(
        e => {
          if (e !== null) {
            this.data = e;
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
    const { bond } = execution.execution.product.security;
    if (bond) {
      return 'Bond';
    }
    return 'No Product';
  }
}
