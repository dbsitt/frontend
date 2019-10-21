import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { cloneDeep } from 'lodash';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { HelperService } from '../helperService';
import { ROLES } from '../blockchain.constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-allocate-trade',
  templateUrl: './allocate-trade.component.html',
  styleUrls: ['./allocate-trade.component.scss'],
})
export class AllocateTradeComponent implements OnInit, OnDestroy {
  columns = ['tradeAndClient', 'productRelated', 'valueRelated'];

  @Input() data = null;
  @Output() cancel = new EventEmitter();
  tableData = [];

  allocation1 = 0;
  allocation2 = 0;
  currentUserSubscription$: any;

  constructor(
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
    private helperService: HelperService,
    private router: Router
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
    this.currentUserSubscription$ = this.helperService.currentUser$.subscribe(
      e => {
        if (e.role !== ROLES.BROKER) {
          this.router.navigateByUrl('transactions/account');
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.currentUserSubscription$.unsubscribe();
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
      return false;
    }
    const total: number = +this.allocation1 + +this.allocation2;
    if (total !== +quantity) {
      this.snackBar.open(
        'Allocated total should be equal to transaction quantity',
        'Close',
        {
          duration: 2000,
        }
      );
      return false;
    }
    return true;
  }

  isValidNumber(num): boolean {
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
