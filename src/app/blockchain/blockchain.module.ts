import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsComponent } from './transactions/transactions.component';
import { Routes, RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import * as fromBlockchain from './blockchain.reducers';
import { AffirmTransactionComponent } from './affirm-transaction/affirm-transaction.component';
import { AllocateTransactionComponent } from './allocate-transaction/allocate-transaction.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatInputModule,
  MatButtonModule,
  MatSnackBarModule,
  MatCardModule,
  MatTableModule,
} from '@angular/material';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { BlockTradeComponent } from './block-trade/block-trade.component';
import { MonitoringComponent } from './monitoring/monitoring.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { AccountSummaryComponent } from './account-summary/account-summary.component';
import { TradeSummaryComponent } from './trade-summary/trade-summary.component';
import { APIInterceptor } from '../interceptors';
import { ExecutionStatesComponent } from './execution-states/execution-states.component';
import { ApiService } from './apiService';

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
    AccountSummaryComponent,
    TradeSummaryComponent,
    ExecutionStatesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(blockchainRoutes),
    StoreModule.forFeature('blockchain', fromBlockchain.blockchainReducer, {
      metaReducers: fromBlockchain.metaReducers,
    }),
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatSnackBarModule,
    MatCardModule,
    HttpClientModule,
    NgxJsonViewerModule,
    MatTableModule,
  ],
  providers: [
    ApiService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: APIInterceptor,
      multi: true,
    },
  ],
})
export class BlockchainModule {}
