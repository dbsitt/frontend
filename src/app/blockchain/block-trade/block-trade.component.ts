import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HelperService } from '../helperService';
import { TradeFlow } from '../TradeFlow';
import { Router } from '@angular/router';
import { ROLES } from '../blockchain.constants';

@Component({
  selector: 'app-block-trade',
  templateUrl: './block-trade.component.html',
  styleUrls: ['./block-trade.component.scss'],
})
export class BlockTradeComponent extends TradeFlow implements OnInit {
  hasActionAccess = ['Broker1'];

  hasViewAccess = ['Broker1', 'Client1'];

  constructor(
    snackBar: MatSnackBar,
    helperService: HelperService,
    private router: Router
  ) {
    super(helperService, snackBar);
  }

  ngOnInit() {
    this.helperService.currentUser$.subscribe(e => {
      if (e.role === ROLES.SETTLEMENT_AGENT) {
        this.router.navigateByUrl('transactions/admin');
      }
    });
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
