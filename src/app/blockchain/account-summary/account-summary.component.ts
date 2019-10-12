import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-account-summary',
  templateUrl: './account-summary.component.html',
  styleUrls: ['./account-summary.component.scss'],
})
export class AccountSummaryComponent implements OnInit {
  cashAccount: number;
  securityHolding: string;

  constructor() {}

  ngOnInit() {
    this.cashAccount = 12345;
    this.securityHolding = '12345';
  }
}
