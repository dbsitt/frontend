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
export class AllocateTransactionComponent {
  allocateResponse$: Observable<any>;

  constructor(
    private helperService: HelperService,
    private snackBar: MatSnackBar
  ) {}
}
