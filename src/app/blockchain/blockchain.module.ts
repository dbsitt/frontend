import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsComponent } from './transactions/transactions.component';
import { Routes, RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import * as fromBlockchain from './blockchain.reducers';
import { EffectsModule } from '@ngrx/effects';
import { BlockchainEffects } from './blockchain.effects';
import { AffirmTransactionComponent } from './affirm-transaction/affirm-transaction.component';
import { AllocateTransactionComponent } from './allocate-transaction/allocate-transaction.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatInputModule,
  MatButtonModule,
  MatSnackBarModule,
  MatCardModule,
} from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { BlockTradeComponent } from './block-trade/block-trade.component';
import { MonitoringComponent } from './monitoring/monitoring.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

const blockchainRoutes: Routes = [
  {
    path: '',
    component: BlockTradeComponent,
  },
  {
    path: 'monitor',
    component: MonitoringComponent,
  },
  {
    path: 'affirm',
    component: AffirmTransactionComponent,
  },
  {
    path: 'allocate',
    component: AllocateTransactionComponent,
  },
  {
    path: 'confirm',
    component: ConfirmationComponent,
  },
];

@NgModule({
  declarations: [
    TransactionsComponent,
    AffirmTransactionComponent,
    AllocateTransactionComponent,
    ConfirmationComponent,
    BlockTradeComponent,
    MonitoringComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(blockchainRoutes),
    StoreModule.forFeature('blockchain', fromBlockchain.blockchainReducer, {
      metaReducers: fromBlockchain.metaReducers,
    }),
    EffectsModule.forFeature([BlockchainEffects]),
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatSnackBarModule,
    MatCardModule,
    HttpClientModule,
    NgxJsonViewerModule,
  ],
})
export class BlockchainModule {}
