import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '../helperService';
import { USERNAMES, ROLES } from '../blockchain.constants';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import moment from 'moment';

@Component({
  selector: 'app-execute-trade',
  templateUrl: './execute-trade.component.html',
  styleUrls: ['./execute-trade.component.scss'],
})
export class ExecuteTradeComponent implements OnInit, OnDestroy {
  client = 'Client1';
  buySell = 'Buy';
  product = 'DH0371475458';
  quantity: number = null;
  price: number = null;
  tradeDate = new FormControl(moment().toDate());
  eventDate = new FormControl(
    moment()
      .add(1, 'd')
      .toDate()
  );
  currentUserSubscription$: any;

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
    if (!this.quantity || this.quantity <= 0) {
      this.snackBar.open('Quantity must be greater than zero', 'Close', {
        duration: 2000,
      });
      return false;
    }
    if (!this.price || this.price <= 0) {
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
    this.quantity = null;
    this.price = null;
    this.tradeDate.setValue(moment().toDate());
    this.eventDate.setValue(
      moment()
        .add(1, 'd')
        .toDate()
    );
  }

  onSubmit() {
    const { buySell, client, product, price, quantity } = this;
    const tradeDate = moment(this.tradeDate.value).format('YYYY/MM/DD');
    const eventDate = moment(this.eventDate.value).format('YYYY/MM/DD');
    const executingParty = this.helperService.getCurrentUserId();
    const counterParty = this.counterparty;

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
