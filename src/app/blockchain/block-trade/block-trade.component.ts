import { Component, OnInit } from '@angular/core';
import { HelperService } from '../helperService';
import { Router } from '@angular/router';
import { ROLES } from '../blockchain.constants';

@Component({
  selector: 'app-block-trade',
  templateUrl: './block-trade.component.html',
  styleUrls: ['./block-trade.component.scss'],
})
export class BlockTradeComponent implements OnInit {
  hasActionAccess = ['Broker1'];

  hasViewAccess = ['Broker1', 'Client1'];

  constructor(private helperService: HelperService, private router: Router) {}

  ngOnInit() {
    this.helperService.currentUser$.subscribe(e => {
      if (
        e.role === ROLES.SETTLEMENT_AGENT ||
        e.role === ROLES.COLLATERAL_AGENT
      ) {
        this.router.navigateByUrl('transactions/allocate');
      }
    });
  }
}
