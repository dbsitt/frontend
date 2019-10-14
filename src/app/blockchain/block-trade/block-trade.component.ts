import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HelperService } from '../helperService';
import { TradeFlow } from '../TradeFlow';

@Component({
  selector: 'app-block-trade',
  templateUrl: './block-trade.component.html',
  styleUrls: ['./block-trade.component.scss'],
})
export class BlockTradeComponent extends TradeFlow {
  hasActionAccess = ['Broker1'];

  hasViewAccess = ['Broker1', 'Client1'];

  constructor(snackBar: MatSnackBar, helperService: HelperService) {
    super(helperService, snackBar);
  }

  get currentUserId() {
    return this.helperService.getCurrentUserId();
  }

  onSubmit() {
    this.helperService.postJson(
      this.content,
      this.hasActionAccess,
      '/execution'
    );
  }
}
