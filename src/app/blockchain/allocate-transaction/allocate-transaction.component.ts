import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { HelperService } from '../helperService';
import { TradeFlow } from '../TradeFlow';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-allocate-transaction',
  templateUrl: './allocate-transaction.component.html',
  styleUrls: ['./allocate-transaction.component.scss'],
})
export class AllocateTransactionComponent extends TradeFlow {
  allocateResponse$: Observable<any>;
  hasActionAccess = ['Broker1'];
  hasViewAccess = ['Broker1', 'Client1'];

  constructor(helperService: HelperService, snackBar: MatSnackBar) {
    super(helperService, snackBar);
  }

  onSubmit() {
    this.helperService.postJson(
      this.content,
      this.hasActionAccess,
      '/allocation'
    );
  }
}
