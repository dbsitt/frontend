import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '../helperService';
import { USERNAMES, ROLES } from '../blockchain.constants';
import { MatSnackBar, ErrorStateMatcher } from '@angular/material';
import { Router } from '@angular/router';
import {
  FormControl,
  Validators,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import moment from 'moment';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-execute-trade',
  templateUrl: './execute-trade.component.html',
  styleUrls: ['./execute-trade.component.scss'],
})
export class ExecuteTradeComponent implements OnInit, OnDestroy {
  matcher = new MyErrorStateMatcher();
  client = 'Client1';
  buySell = 'Buy';
  product = 'DH0371475458';
  tradeDate = new FormControl(moment().toDate());
  eventDate = new FormControl(
    moment()
      .add(1, 'd')
      .toDate()
  );
  currentUserSubscription$: any;

  quantityFormControl = new FormControl('', [
    Validators.required,
    Validators.min(1),
  ]);
  priceFormControl = new FormControl('', [
    Validators.required,
    Validators.min(1),
  ]);

  constructor(
    private httpClient: HttpClient,
    private helperService: HelperService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
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

  onValueChange(type, event) {
    const { value } = event.target;
    this[type] = value;
  }

  onSelectChange(type, event) {
    const { value } = event;
    this[type] = value;
  }

  validate(): boolean {
    const { priceFormControl, quantityFormControl } = this;

    const price = priceFormControl.value;
    const quantity = quantityFormControl.value;
    if (!quantity || quantity <= 0) {
      this.snackBar.open('Quantity must be greater than zero', 'Close', {
        duration: 2000,
      });
      return false;
    }
    if (!price || price <= 0) {
      this.snackBar.open('Price must be greater than zero', 'Close', {
        duration: 2000,
      });
      return false;
    }

    return true;
  }

  get counterparty() {
    return this.helperService.getCurrentUserId() === USERNAMES.BROKER1
      ? USERNAMES.BROKER2
      : USERNAMES.BROKER1;
  }

  onCancel() {
    this.client = USERNAMES.CLIENT1;
    this.buySell = 'Buy';
    this.product = 'DH0371475458';
    this.quantityFormControl.setValue('');
    this.priceFormControl.setValue('');
    this.tradeDate.setValue(moment().toDate());
    this.eventDate.setValue(
      moment()
        .add(1, 'd')
        .toDate()
    );
  }

  onSubmit() {
    const {
      buySell,
      client,
      product,
      priceFormControl,
      quantityFormControl,
    } = this;
    const tradeDate = moment(this.tradeDate.value).format('YYYY/MM/DD');
    const eventDate = moment(this.eventDate.value).format('YYYY/MM/DD');
    const executingParty = this.helperService.getCurrentUserId();
    const counterParty = this.counterparty;

    const price = priceFormControl.value;
    const quantity = quantityFormControl.value;

    if (this.validate()) {
      this.httpClient
        .post(this.helperService.getBaseUrl() + '/book/blockTrade', {
          client,
          executingParty,
          counterParty,
          buySell,
          product,
          price,
          quantity,
          tradeDate,
          eventDate,
        })
        .subscribe(() => {
          this.snackBar.open('Successfully allocated', 'Close', {
            duration: 2000,
          });
        });
    }
  }
}
