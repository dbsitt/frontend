import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '../helperService';
import { USERNAMES, ROLES, generateAccountData } from '../blockchain.constants';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import moment from 'moment';
import { MyErrorStateMatcher } from '../ErrorStateMatcher';
import { FromEventTarget } from 'rxjs/internal/observable/fromEvent';
import { Store } from '@ngrx/store';
import { UiState } from 'src/app/store/ui.reducer';
import { setLoading } from 'src/app/store/ui.actions';
import { finalize } from 'rxjs/operators';

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
    private uiStore: Store<UiState>,
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
    const executingEntity = this.helperService.getCurrentUserId();
    const counterParty = this.counterparty;

    const price = priceFormControl.value;
    const quantity = quantityFormControl.value;

    const clientAccount = generateAccountData(client).mainAccount;
    const counterPartyAccount = generateAccountData(counterParty).mainAccount;
    const executingEntityAccount = generateAccountData(executingEntity)
      .mainAccount;

    if (this.validate()) {
      this.uiStore.dispatch(setLoading({ value: true }));
      this.httpClient
        .post(this.helperService.getBaseUrl() + '/book/blocktrade', {
          client: clientAccount,
          executingEntity: executingEntityAccount,
          counterParty: counterPartyAccount,
          buySell: buySell.toLocaleLowerCase(),
          product,
          price,
          quantity,
          tradeDate,
          eventDate,
        })
        .pipe(
          finalize(() => {
            this.uiStore.dispatch(setLoading({ value: false }));
          })
        )
        .subscribe(() => {
          this.snackBar.open('Successfully allocated', 'Close', {
            duration: 2000,
          });
        });
    }
  }

  formSubmit(event) {
    event.preventDefault();
  }
}
