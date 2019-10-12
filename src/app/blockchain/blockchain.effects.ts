import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BlockchainAction, fetchAllSuccessful } from './blockchain.actions';
import { map } from 'rxjs/operators';
import { Transaction } from './blockchain';

@Injectable()
export class BlockchainEffects {
  constructor(private actions$: Actions) {}

  fetchAll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BlockchainAction.fetchAllStarted),
      map(() => {
        const list: Transaction[] = [];

        for (let i = 0; i < 20; i++) {
          const transaction: Transaction = {
            linearId: this.makeid(20),
            amount: Math.floor(Math.random() * 100),
          };
          list.push(transaction);
        }

        return fetchAllSuccessful({ transactions: list });
      })
    )
  );

  makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    return result;
  }
}
