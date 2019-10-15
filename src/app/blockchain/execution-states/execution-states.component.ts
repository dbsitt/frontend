import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, filter, takeLast, throttleTime } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { UiState } from 'src/app/store/ui.reducer';
import { setLoading } from 'src/app/store/ui.actions';
import { MatSnackBar } from '@angular/material';
import { UserState } from 'src/app/store/user.reducers';
import { getCurrentUser } from 'src/app/store/user.selector';
import { HelperService } from '../helperService';
import { ExecutionState } from '../blockchain';
import {
  BROKER_BLOCKTRADE_COLUMNS,
  CLIENT_BLOCKTRADE_COLUMNS,
  BROKER_ALLOCATION_TRADE_COLUMNS,
  CLIENT_ALLOCATION_TRADE_COLUMNS,
  SETTLEMENT_AGENT_COLUMNS,
} from './columns';
import {
  ALLOCATION_TRADE_STATUS,
  BLOCK_TRADE_STATUS,
  ROLES,
  ACTIONS,
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
        columns = BROKER_BLOCKTRADE_COLUMNS;
      } else if (userRole === ROLES.CLIENT) {
        columns = CLIENT_BLOCKTRADE_COLUMNS;
      }
    } else if (this.type === 'allocation-trade') {
      if (userRole === ROLES.BROKER) {
        columns = BROKER_ALLOCATION_TRADE_COLUMNS;
      } else if (userRole === ROLES.CLIENT) {
        columns = CLIENT_ALLOCATION_TRADE_COLUMNS;
      }
      // TODO check this
    } else if (this.type === 'settlement-agent') {
      columns = SETTLEMENT_AGENT_COLUMNS;
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

    switch (this.type) {
      case 'block-trade':
        url = '/blocktrades';
        break;
      case 'allocation-trade':
        url = '/allocations';
        break;
    }

    this.uiStore.dispatch(setLoading({ value: true }));
    this.httpClient
      .get(this.helperService.getBaseUrl() + url)
      .pipe(
        throttleTime(10),
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
    return {
      ...data,
      blockNumber: exec.execution.meta.externalKey,
      allocationNumber: exec.execution.meta.globalKey,
      status: exec.status,
      prodType: data.productType,
    };
  }

  mapClientAllocationTrade(exec) {
    const { data } = exec;
    return {
      ...data,
      blockNumber: exec.execution.meta.externalKey,
      allocationNumber: exec.execution.meta.globalKey,
      status: exec.status,
      prodType: data.productType,
    };
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

  availableAction(execution: ExecutionState): string {
    if (this.type === 'block-trade') {
      if (execution.status === BLOCK_TRADE_STATUS.EMPTY) {
        return ACTIONS.ALLOCATE;
      }
    } else if (this.type === 'allocation-trade') {
      if (this.currentUserRole === ROLES.BROKER) {
        switch (execution.status) {
          case ALLOCATION_TRADE_STATUS.UNAFFIRMED:
            return null;
          case ALLOCATION_TRADE_STATUS.AFFIRMED:
            return ACTIONS.CONFIRM;
          case ALLOCATION_TRADE_STATUS.CONFIRMED:
            return null;
        }
      }
    }
  }

  performAction(e) {
    const action = this.availableAction(e);
    switch (action) {
      case ACTIONS.ALLOCATE:
        this.httpClient.post(this.helperService.getBaseUrl() + '/allocate', {});
        break;
      case ACTIONS.CONFIRM:
        this.httpClient.post(this.helperService.getBaseUrl() + '/confirm', {});
        break;
      default:
        this.snackBar.open('Should not be executed', 'Close', {
          duration: 2000,
        });
    }
    console.log(e);
  }
}
