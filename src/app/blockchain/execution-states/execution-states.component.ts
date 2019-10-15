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
  CONFIRMED_ALLOCATION_TRADES_STATUS,
} from '../blockchain.constants';
import { exec } from 'child_process';

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
      } else if (userRole === ROLES.SETTLEMENT_AGENT) {
        columns = SETTLEMENT_AGENT_COLUMNS;
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

  get currentUserId() {
    return this.helperService.getCurrentUserId();
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
            this.tableData = this.mapExecutions(response);
          }
        },
        () => {
          this.tableData = [];
          this.snackBar.open(
            `Error occur when fetching execution-states for ${this.currentUserId}`,
            'Close',
            {
              duration: 2000,
            }
          );
        }
      );
  }

  mapExecutions(executions: any[]): any[] {
    return executions.map(response => {
      if (this.type === 'block-trade') {
        if (this.currentUserRole === ROLES.BROKER) {
          return this.mapBrokerBlockTrade(response);
        } else if (this.currentUserRole === ROLES.CLIENT) {
          return this.mapClientBlockTrade(response);
        }
      } else if (this.type === 'allocation-trade') {
        if (this.currentUserRole === ROLES.BROKER) {
          return this.mapBrokerAllocationTrade(response);
        } else if (this.currentUserRole === ROLES.CLIENT) {
          return this.mapClientAllocationTrade(response);
        } else if (this.currentUserRole === ROLES.SETTLEMENT_AGENT) {
          return this.mapSettlementAgentAllocationTrade(response);
        }
      }
    });
  }

  mapClientBlockTrade(response: any) {
    const { data } = response;
    return {
      ...data,
      tradeNumber: data.blockTradeNum,
      prodType: data.productType,
    };
  }

  mapBrokerBlockTrade(response: any) {
    const { data } = response;
    return {
      ...data,
      tradeNumber: data.blockTradeNum,
      prodType: data.productType,
    };
  }

  mapBrokerAllocationTrade(response: any) {
    const { data } = response;
    return {
      ...data,
      blockNumber: response.execution.meta.externalKey,
      allocationNumber: response.execution.meta.globalKey,
      status: response.status,
      prodType: data.productType,
    };
  }

  mapClientAllocationTrade(response: any) {
    const { data } = response;
    return {
      ...data,
      blockNumber: response.execution.meta.externalKey,
      allocationNumber: response.execution.meta.globalKey,
      tradeAndAllocationNumber: {
        blockNumber: response.execution.meta.externalKey,
        allocationNumber: response.execution.meta.globalKey,
      },
      status: response.status,
      prodType: data.productType,
    };
  }

  mapSettlementAgentAllocationTrade(response) {
    const { data } = response;
    return {
      ...data,
      tradeNumber: response.execution.meta.globalKey,
      broker: 'hardcoded',
      status: response.status,
      prodType: data.productType,
    };
  }

  availableAction(execution: ExecutionState): string {
    if (this.type === 'block-trade') {
      if (execution.status === BLOCK_TRADE_STATUS.EMPTY) {
        return ACTIONS.ALLOCATE;
      } else if (execution.status === BLOCK_TRADE_STATUS.ALLOCATED) {
        return null;
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
      } else if (this.currentUserRole === ROLES.CLIENT) {
        switch (execution.status) {
          case ALLOCATION_TRADE_STATUS.UNAFFIRMED:
            return ACTIONS.AFFIRM;
          case ALLOCATION_TRADE_STATUS.AFFIRMED:
            return null;
          case ALLOCATION_TRADE_STATUS.CONFIRMED:
            return null;
        }
      } else if (this.currentUserRole === ROLES.SETTLEMENT_AGENT) {
        switch (execution.status) {
          case CONFIRMED_ALLOCATION_TRADES_STATUS.CONFIRMED:
            return ACTIONS.SETTLE;
          case CONFIRMED_ALLOCATION_TRADES_STATUS.SETTLED:
            return ACTIONS.TRANSFER;
          case CONFIRMED_ALLOCATION_TRADES_STATUS.TRANSFERRED:
            return null;
        }
      }
    }
  }

  sendRequest(url, body) {
    this.uiStore.dispatch(setLoading({ value: true }));
    this.httpClient
      .post(this.helperService.getBaseUrl() + url, body)
      .pipe(
        finalize(() => {
          this.uiStore.dispatch(setLoading({ value: false }));
          this.fetchExecutionStates();
        })
      )
      .subscribe(e => {
        this.snackBar.open('Successful', 'Close', {
          duration: 2000,
        });
      });
  }

  performAction(e) {
    const action = this.availableAction(e);
    switch (action) {
      case ACTIONS.ALLOCATE:
        this.sendRequest('/allocate', {});
        break;
      case ACTIONS.TRANSFER:
        this.sendRequest(`/transfer`, {
          executionRef: e.allocationNumber,
        });
        break;
      case ACTIONS.SETTLE:
        this.sendRequest(`/settlement`, {
          executionRef: e.blockTradeNum,
        });
        break;
      case ACTIONS.AFFIRM:
        this.sendRequest(`/affirmation`, {
          executionRef: e.allocationNumber,
        });
        break;
      case ACTIONS.CONFIRM:
        this.sendRequest(`/confirmation`, {
          executionRef: e.allocationNumber,
        });
        break;
      default:
        this.snackBar.open('Should not be executed', 'Close', {
          duration: 2000,
        });
    }
    console.log(e);
  }
}
