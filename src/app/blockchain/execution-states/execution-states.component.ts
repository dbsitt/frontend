import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, filter } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { UiState } from 'src/app/store/ui.reducer';
import { setLoading } from 'src/app/store/ui.actions';
import { MatSnackBar } from '@angular/material';
import { UserState } from 'src/app/store/user.reducers';
import { getCurrentUser } from 'src/app/store/user.selector';
import { HelperService } from '../helperService';
import { ExecutionState } from '../blockchain';
import {
  BROKER_BLOCKTRADE,
  CLIENT_BLOCKTRADE,
  BROKER_ALLOCATION_TRADE,
  CLIENT_ALLOCATION_TRADE,
} from './columns';
import {
  ALLOCATION_TRADE_STATUS,
  BLOCK_TRADE_STATUS,
  ROLES,
} from '../blockchain.constants';

@Component({
  selector: 'app-execution-states',
  templateUrl: './execution-states.component.html',
  styleUrls: ['./execution-states.component.scss'],
})
export class ExecutionStatesComponent implements OnInit {
  @Input() type: string;

  checkedExecutionList: string[] = [];

  tableData = [];

  get displayedColumns() {
    let columns = [];
    const userRole = this.helperService.getCurrentUserRole();
    if (this.type === 'block-trade') {
      if (userRole === ROLES.BROKER) {
        columns = BROKER_BLOCKTRADE;
      } else if (userRole === ROLES.CLIENT) {
        columns = CLIENT_BLOCKTRADE;
      }
    } else if (this.type === 'allocation-trade') {
      if (userRole === ROLES.BROKER) {
        columns = BROKER_ALLOCATION_TRADE;
      } else if (userRole === ROLES.CLIENT) {
        columns = CLIENT_ALLOCATION_TRADE;
      }
    }

    return columns;
  }

  constructor(
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
    private uiStore: Store<UiState>,
    private userStore: Store<UserState>,
    private helperService: HelperService
  ) {}

  ngOnInit() {
    this.userStore
      .pipe(select(getCurrentUser))
      .pipe(filter(user => user !== null))
      .subscribe(this.fetchExecutionStates.bind(this));
  }

  get currentUserRole() {
    return this.helperService.getCurrentUserRole();
  }

  fetchExecutionStates() {
    let url: string;

    switch (this.currentUserRole) {
      case ROLES.BROKER:
        url = '/blocktrades';
        break;
      case ROLES.BROKER:
        url = '/allocations';
        break;
    }

    this.uiStore.dispatch(setLoading({ value: true }));
    this.httpClient
      .get(this.helperService.getBaseUrl() + url)
      .pipe(
        finalize(() => {
          this.uiStore.dispatch(setLoading({ value: false }));
        })
      )
      .subscribe(
        (response: any) => {
          if (response !== null) {
            this.tableData = this.mapExecutions(response.entity);
          }
        },
        () => {
          console.log('err');
          this.snackBar.open(
            'Error occur when fetching execution-states',
            'Close',
            {
              duration: 2000,
            }
          );
        }
      );
  }

  mapExecutions(executions: any[]): any[] {
    return executions.map(exec => {
      if (this.type === 'block-trade') {
        if (this.currentUserRole === ROLES.BROKER) {
          return this.mapBrokerBlockTrade(exec);
        } else if (this.currentUserRole === ROLES.CLIENT) {
          return this.mapClientBlockTrade(exec);
        }
      } else if (this.type === 'allocation-trade') {
        if (this.currentUserRole === ROLES.BROKER) {
          return this.mapBrokerAllocationTrade(exec);
        } else if (this.currentUserRole === ROLES.CLIENT) {
          return this.mapClientAllocationTrade(exec);
        }
      }
    });
  }

  mapClientBlockTrade(exec) {
    const { data } = exec;
    return {
      ...data,
      tradeNumber: data.blockTradeNum,
      prodType: data.productType,
    };
  }

  mapBrokerBlockTrade(exec) {
    const { data } = exec;
    return {
      ...data,
      tradeNumber: data.blockTradeNum,
      prodType: data.productType,
    };
  }

  mapBrokerAllocationTrade(exec) {
    const { data } = exec;
    console.log(data);
    return {
      ...data,
      blockNumber: data.blockTradeNum,

      prodType: data.productType,
    };
  }

  mapClientAllocationTrade(exec) {
    const { data } = exec;
    return this.dummyJson();
  }

  dummyJson() {
    const str = 'string';
    const num = 123;
    const date = '15-10-2019';
    const status = '-';
    const currency = '$';
    return {
      status,
      currency,
      tradeNumber: str,
      blockNumber: str,
      allocationNumber: str,
      client: 'Client',
      broker: 'Broker',
      prodType: str,
      product: str,
      quantity: str,
      price: num,
      cash: num,
      valueDate: date,
    };
  }

  isActionEnabled(execution: ExecutionState): string {
    if (this.type === 'block-trade') {
      if (execution.status === BLOCK_TRADE_STATUS.EMPTY) {
        return 'Allocate';
      }
    } else if (this.type === 'allocation-trade') {
      if (this.currentUserRole === ROLES.BROKER) {
        switch (execution.status) {
          case ALLOCATION_TRADE_STATUS.UNAFFIRMED:
            return null;
          case ALLOCATION_TRADE_STATUS.AFFIRMED:
            return 'Confirm';
          case ALLOCATION_TRADE_STATUS.CONFIRMED:
            return null;
        }
      }
    }
  }

  performAction(e) {
    console.log(e);
  }
}
