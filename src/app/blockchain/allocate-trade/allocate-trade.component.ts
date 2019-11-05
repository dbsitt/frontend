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
import { ROLES, USERNAMES, generateAccountData } from '../blockchain.constants';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { MyErrorStateMatcher } from '../ErrorStateMatcher';
import { Store } from '@ngrx/store';
import { UiState } from 'src/app/store/ui.reducer';
import { setLoading } from 'src/app/store/ui.actions';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-allocate-trade',
  templateUrl: './allocate-trade.component.html',
  styleUrls: ['./allocate-trade.component.scss'],
})
export class AllocateTradeComponent implements OnInit, OnDestroy {
  columns = ['tradeAndClient', 'productRelated', 'valueRelated'];
  matcher = new MyErrorStateMatcher();

  @Input() data = null;
  @Output() cancel = new EventEmitter();

  allocation1FormControl = new FormControl('', [
    Validators.required,
    Validators.min(1),
  ]);
  allocation2FormControl = new FormControl('', [
    Validators.required,
    Validators.min(1),
  ]);

  tableData = [];

  client = USERNAMES.CLIENT1;

  currentUserSubscription$: any;

  constructor(
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
    private uiStore: Store<UiState>,
    private helperService: HelperService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.data) {
      this.tableData = cloneDeep([this.data]);
    }
    this.currentUserSubscription$ = this.helperService.currentUser$.subscribe(
      e => {
        if (e && e.role !== ROLES.BROKER) {
          this.router.navigateByUrl('transactions/account');
        }
      }
    );
    this.allocation1FormControl.valueChanges.subscribe(value => {
      this.allocation2FormControl.setValue(this.data.quantity - value, {
        emitEvent: false,
      });
    });
    this.allocation2FormControl.valueChanges.subscribe(value => {
      this.allocation1FormControl.setValue(this.data.quantity - value, {
        emitEvent: false,
      });
    });
  }

  ngOnDestroy(): void {
    this.currentUserSubscription$.unsubscribe();
  }

  validate(): boolean {
    const { quantity } = this.data;

    if (
      !this.isValidNumber(this.allocation1FormControl.value) ||
      !this.isValidNumber(this.allocation2FormControl.value)
    ) {
      this.snackBar.open('Should be a positive integer', 'Close', {
        duration: 2000,
      });
      return false;
    }
    const total: number =
      +this.allocation1FormControl.value + +this.allocation2FormControl.value;
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

  get clientData() {
    if (!this.data) {
      return null;
    }

    return generateAccountData(this.data.client);
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

    const { tradeNumber, client } = this.data;
    this.uiStore.dispatch(setLoading({ value: true }));

    const { subAccount1, subAccount2 } = generateAccountData(client);

    this.httpClient
      .post(
        this.helperService.getBaseUrl() + '/allocateTrade',
        {
          executionRef: tradeNumber,
          amount1: this.allocation1FormControl.value,
          amount2: this.allocation2FormControl.value,
          subAccount1,
          subAccount2,
        },
        { responseType: 'text' }
      )
      .pipe(
        finalize(() => {
          this.uiStore.dispatch(setLoading({ value: false }));
        })
      )
      .subscribe(res => {
        this.snackBar.open(res, 'Close', {
          duration: 2000,
        });
        this.onCancel();
        this.router.navigateByUrl('transactions/allocate');
        console.log('gino');
      });
  }

  formSubmit(event) {
    event.preventDefault();
  }
}
