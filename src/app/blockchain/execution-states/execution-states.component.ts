import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-execution-states',
  templateUrl: './execution-states.component.html',
  styleUrls: ['./execution-states.component.scss'],
})
export class ExecutionStatesComponent implements OnInit {
  url = 'http://3.1.246.227:10060/execution-states';

  data: any;

  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    this.httpClient
      .get(this.url)
      .pipe(filter(res => res !== null))
      .subscribe(e => {
        this.data = e;
      });
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
