import { Component, OnInit } from '@angular/core';
import { BlockchainState } from '../blockchain.reducers';
import { Store, select } from '@ngrx/store';
import { fetchAllStarted } from '../blockchain.actions';
import { Observable } from 'rxjs';
import { Transaction } from '../blockchain';
import { getTransactions } from '../blokchain.selectors';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent implements OnInit {
  constructor(private store: Store<BlockchainState>) {}

  transactions$: Observable<Transaction[]>;

  ngOnInit() {
    this.transactions$ = this.store.pipe(select(getTransactions));
  }

  onFetchAll() {
    this.store.dispatch(fetchAllStarted());
  }
}
