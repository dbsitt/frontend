import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { cloneDeep } from 'lodash';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { HelperService } from '../helperService';

@Component({
  selector: 'app-allocate-trade',
  templateUrl: './allocate-trade.component.html',
  styleUrls: ['./allocate-trade.component.scss'],
})
export class AllocateTradeComponent implements OnInit {
  columns = ['tradeAndClient', 'productRelated', 'valueRelated'];

  @Input() data = null;
  @Output() cancel = new EventEmitter();
  tableData = [];

  allocation1 = 0;
  allocation2 = 0;

  constructor(
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
    private helperService: HelperService
  ) {}

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
    const total: number = +this.allocation1 + +this.allocation2;
    console.log(total);
    console.log(this.allocation1);
    console.log(this.allocation2);
    console.log(quantity);
    console.log(quantity === total);
    console.log(typeof +quantity, typeof total);
    return total === +quantity;
  }

  isValidNumber(num): boolean {
    console.log(num);
    console.log(!isNaN(+num));
    return !isNaN(+num) && num > 0;
  }

  get displayedColumns() {
    return this.columns;
  }

  onCancel() {
    this.cancel.emit();
  }

  onSubmit() {
    if (!this.validate()) {
      return;
    }

    const { tradeNumber } = this.data;
    this.httpClient
      .post(this.helperService.getBaseUrl() + '/allocateTrade', {
        executionRef: tradeNumber,
        amount1: this.allocation1,
        amount2: this.allocation2,
      })
      .subscribe(() => {
        this.snackBar.open('Successfully allocated', 'Close', {
          duration: 2000,
        });
        this.onCancel();
      });
  }
}
