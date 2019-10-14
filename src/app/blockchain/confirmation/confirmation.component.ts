import { Component } from '@angular/core';
import { HelperService } from '../helperService';
import { TradeFlow } from '../TradeFlow';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-confirm-transaction',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent extends TradeFlow {
  hasActionAccess = ['Broker1'];

  hasViewAccess = ['Broker1, Client1'];

  constructor(helperService: HelperService, snackBar: MatSnackBar) {
    super(helperService, snackBar);
  }

  onSubmit() {
    this.helperService.postJson(this.content, this.hasActionAccess, '/confirm');
  }
}
