import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-trade-summary',
  templateUrl: './trade-summary.component.html',
  styleUrls: ['./trade-summary.component.scss'],
})
export class TradeSummaryComponent implements OnInit {
  @Input() data: any;

  constructor() {}

  ngOnInit() {}

  get eventDate() {
    const { eventDate } = this.data;
    return `${eventDate.day}-${eventDate.month}-${eventDate.year}`;
  }

  get eventIdentifier() {
    return this.data.eventIdentifier[0].meta.globalKey;
  }

  get parties() {
    return this.data.party;
  }

  get priceObject() {
    return this.data.primitive.execution[0].after.execution.price;
  }

  get productSecurity() {
    return this.data.primitive.execution[0].after.execution.product.security
      .bond.productIdentifier.identifier[0].value;
  }

  get quantity() {
    return this.execution.quantity.amount;
  }

  get execution() {
    return this.data.primitive.execution[0].after.execution;
  }

  get settlementTerms() {
    return this.execution.settlementTerms;
  }

  get settlementDate() {
    const {
      day,
      month,
      year,
    } = this.settlementTerms.settlementDate.adjustableDate.unadjustedDate;
    return `${day}-${month}-${year}`;
  }

  get tradeDate() {
    const { day, month, year } = this.execution.tradeDate.value;

    return `${day}-${month}-${year}`;
  }

  get product() {
    return 'Bond';
  }
}
