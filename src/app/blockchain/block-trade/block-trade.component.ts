import { Component, OnInit, OnDestroy } from '@angular/core';
import { HelperService } from '../helperService';
import { Router } from '@angular/router';
import { ROLES } from '../blockchain.constants';

@Component({
  selector: 'app-block-trade',
  templateUrl: './block-trade.component.html',
  styleUrls: ['./block-trade.component.scss'],
})
export class BlockTradeComponent implements OnInit, OnDestroy {
  hasActionAccess = ['Broker1'];

  hasViewAccess = ['Broker1', 'Client1'];
  currentUserSubscription$: any;

  constructor(private helperService: HelperService, private router: Router) {}

  ngOnInit() {
    this.currentUserSubscription$ = this.helperService.currentUser$.subscribe(
      e => {
        if (e.role === ROLES.COLLATERAL_AGENT) {
          this.router.navigateByUrl('transactions/allocate');
        }
      }
    );
  }

  ngOnDestroy() {
    this.currentUserSubscription$.unsubscribe();
  }
}
