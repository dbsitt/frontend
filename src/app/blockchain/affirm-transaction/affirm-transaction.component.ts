import { Component } from '@angular/core';
import { HelperService } from '../helperService';
import { TradeFlow } from '../TradeFlow';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-affirm-transaction',
  templateUrl: './affirm-transaction.component.html',
  styleUrls: ['./affirm-transaction.component.scss'],
})
export class AffirmTransactionComponent extends TradeFlow {
  hasActionAccess = ['Broker1'];

  hasViewAccess = ['Broker1', 'Client1'];

  constructor(helperService: HelperService, snackBar: MatSnackBar) {
    super(helperService, snackBar);
  }

  onSubmit() {
    this.helperService.postJson(
      this.content,
      this.hasActionAccess,
      '/affirmation'
    );
  }
}
