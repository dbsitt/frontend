import { Component, OnInit, Input } from '@angular/core';
import { cloneDeep } from 'lodash';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-allocate-trade',
  templateUrl: './allocate-trade.component.html',
  styleUrls: ['./allocate-trade.component.scss'],
})
export class AllocateTradeComponent implements OnInit {
  columns = ['tradeAndClient', 'productRelated', 'valueRelated'];

  @Input() data = null;
  tableData = [];

  allocation1 = 0;
  allocation2 = 0;

  constructor(private httpClient: HttpClient, private snackBar: MatSnackBar) {
    console.log(this.data);
  }

  onValueChange(type, event) {
    const { value } = event.target;
    if (type === 'allocation1') {
      this.allocation1 = value;
      this.allocation2 = this.data.quantity - value;
    } else if (type === 'allocation2') {
      this.allocation2 = value;
      this.allocation1 = this.data.quantity - value;
    }
  }

  ngOnInit() {
    if (this.data) {
      this.tableData = cloneDeep([this.data]);
    }
  }

  validate(): boolean {
    const { quantity } = this.data;
    if (
      !this.isValidNumber(this.allocation1) ||
      !this.isValidNumber(this.allocation2)
    ) {
      this.snackBar.open('Should be a positive integer', 'Close', {
        duration: 2000,
      });
    }
    const isEqualToQuantity = this.allocation1 + this.allocation2 === quantity;
    return isEqualToQuantity;
  }

  isValidNumber(num): boolean {
    return typeof num === 'number' && num > 0;
  }

  get displayedColumns() {
    return this.columns;
  }

  onSubmit() {
    const { tradeNumber } = this.data;
    this.httpClient.post('allocateTrade', {
      executionRef: tradeNumber,
      amount1: this.allocation1,
      amount2: this.allocation2,
    });
  }
}
