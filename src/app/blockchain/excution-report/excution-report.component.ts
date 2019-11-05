import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, filter, debounceTime } from 'rxjs/operators';
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
import { Observable } from 'rxjs';
import { getIsLoading } from 'src/app/store/ui.selector';
import { Router } from '@angular/router';

@Component({
  selector: 'app-excutionreport-states',
  templateUrl: './excution-report.component.html',
  styleUrls: ['./excution-report.component.scss'],
})
export class ExcutionReportComponent implements OnInit, OnDestroy {
  @Input() type: string;

  checkedExecutionList: string[] = [];

  isLoading$: Observable<boolean>;

  tableData = [];
  tableDataCache = [];

  autoNavigateSubscription$: any;
  currentUserSubscription$: any;

  ngOnInit() {
    this.type = 'allocation-trade';
    this.currentUserSubscription$ = this.userStore
      .pipe(select(getCurrentUser))
      .pipe(filter(user => user !== null))
      .subscribe(this.fetchExecutionStates.bind(this));

    this.isLoading$ = this.uiStore.pipe(select(getIsLoading));
    this.autoNavigateSubscription$ = this.helperService.currentUser$.subscribe(
      e => {
        if (e && e.role !== ROLES.BROKER) {
          this.router.navigateByUrl('transactions/account');
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.autoNavigateSubscription$.unsubscribe();
    this.currentUserSubscription$.unsubscribe();
  }

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
      } else if (userRole === ROLES.COLLATERAL_AGENT) {
        columns = SETTLEMENT_AGENT_COLUMNS;
      }
    }
    let _columns = columns.filter(function(item) {
      return item !== 'action';
    });
    return _columns;
  }

  constructor(
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
    private uiStore: Store<UiState>,
    private userStore: Store<UserState>,
    private helperService: HelperService,
    private router: Router
  ) {}

  filter(filterVal: any) {
    let result = [];
    this.tableDataCache = this.tableData.filter(function(item) {
      return item.client === filterVal;
    });
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
        debounceTime(10),
        finalize(() => {
          this.uiStore.dispatch(setLoading({ value: false }));
        })
      )
      .subscribe(
        (response: any) => {
          if (response !== null) {
            this.tableData = this.mapExecutions(response);
            this.tableDataCache = this.tableData;
          }
        },
        () => {
          this.tableData = [];
          this.snackBar.open(
            `Error occur when fetching execution report for ${this.currentUserId}`,
            'Close',
            {
              duration: 2000,
            }
          );
        }
      );
  }

  mockData() {
    const response = [
      {
        execution: {
          meta: {
            globalKey: 'GLOBAL-akshdfkahsdkfjhasdfkjasdhfkjdsaasdf',
            externalKey: 'EXTERNAL-akshdfjashdfkjhjsadhfjkasdjfjkasd',
          },
          status: 'STATUS',
        },
        data: {
          valueDate: '02-12-2019',
          cash: '123',
          currency: 'USD',
          price: '12132',
          quantity: '45',
          product: 'PROD',
          prodType: 'Bond',
          client: 'CLIENT',
          broker: 'BROKER',
          blockTradeNum: 'TRADENUM=asdfhjkashdfjksdkfjds',
        },
      },
    ];
    this.tableData = this.mapExecutions(response);
  }

  mapTransferParty(role: string, respose: any) {
    const { party, partyRole } = respose.execution;

    const partyRoleReference = partyRole.find(o => o.role === role);

    if (!partyRoleReference) {
      return null;
    }

    const partyReferenceId = partyRoleReference.partyReference.globalReference;

    const nameRef = party.find(o => o.globalReference === partyReferenceId);

    const name = nameRef.value.name.value;

    const buyOrSell = partyRole.find(
      o =>
        o.partyReference.globalReference === partyReferenceId && o.role !== role
    ).role;

    return {
      name,
      buyOrSell,
    };
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
        } else if (this.currentUserRole === ROLES.COLLATERAL_AGENT) {
          return this.mapSettlementAgentAllocationTrade(response);
        }
      }
    });
  }

  commonFieldMapping(data) {
    const {
      valueDate,
      cash,
      currency,
      price,
      quantity,
      product,
      productType,
    } = data;
    return {
      productRelated: {
        product,
        prodType: productType,
        quantity,
      },
      valueRelated: {
        cash,
        currency,
        price,
        valueDate,
      },
    };
  }

  mapBrokerBlockTrade(response: any) {
    const { data } = response;
    return {
      ...data,
      tradeAndClient: {
        tradeNumber: data.blockTradeNum,
        client: this.mapTransferParty('CLIENT', response),
        executingEntity: this.mapTransferParty('EXECUTING_ENTITY', response),
        counterparty: this.mapTransferParty('COUNTERPARTY', response),
      },
      tradeNumber: data.blockTradeNum,
      prodType: data.productType,
      ...this.commonFieldMapping(data),
    };
  }

  mapClientBlockTrade(response: any) {
    const { data } = response;
    return {
      ...data,
      tradeAndBroker: {
        tradeNumber: data.blockTradeNum,
        client: this.mapTransferParty('CLIENT', response),
        executingEntity: this.mapTransferParty('EXECUTING_ENTITY', response),
        counterparty: this.mapTransferParty('COUNTERPARTY', response),
      },
      tradeNumber: data.blockTradeNum,
      prodType: data.productType,
      ...this.commonFieldMapping(data),
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
      ...this.commonFieldMapping(data),
      blockAndAllocationAndClient: {
        client: this.mapTransferParty('CLIENT', response),
        executingEntity: this.mapTransferParty('EXECUTING_ENTITY', response),
        counterparty: this.mapTransferParty('COUNTERPARTY', response),
        blockNumber: response.execution.meta.externalKey,
        allocationNumber: response.execution.meta.globalKey,
      },
    };
  }

  mapClientAllocationTrade(response: any) {
    const { data } = response;
    return {
      ...data,
      blockAndAllocationAndClient: {
        blockNumber: response.execution.meta.externalKey,
        allocationNumber: response.execution.meta.globalKey,
        client: this.mapTransferParty('CLIENT', response),
        executingEntity: this.mapTransferParty('EXECUTING_ENTITY', response),
        counterparty: this.mapTransferParty('COUNTERPARTY', response),
      },
      blockNumber: response.execution.meta.externalKey,
      allocationNumber: response.execution.meta.globalKey,
      status: response.status,
      prodType: data.productType,
      ...this.commonFieldMapping(data),
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
      ...this.commonFieldMapping(data),
      tradeAndBrokerAndClient: {
        tradeNumber: response.execution.meta.globalKey,
        client: this.mapTransferParty('CLIENT', response),
        executingEntity: this.mapTransferParty('EXECUTING_ENTITY', response),
        counterparty: this.mapTransferParty('COUNTERPARTY', response),
      },
    };
  }

  availableAction(execution: ExecutionState): string {
    if (this.type === 'block-trade') {
      return this.actionsForBlockTrade(execution);
    } else if (this.type === 'allocation-trade') {
      return this.actionsForAllocationTrade(execution);
    } else {
      return null;
    }
  }

  actionsForBlockTrade(execution: ExecutionState): string {
    if (execution.status === BLOCK_TRADE_STATUS.EMPTY) {
      return ACTIONS.ALLOCATE;
    } else if (execution.status === BLOCK_TRADE_STATUS.ALLOCATED) {
      return null;
    }
  }

  actionsForAllocationTrade(execution: ExecutionState): string {
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
        case CONFIRMED_ALLOCATION_TRADES_STATUS.INSTRUCTED:
          return ACTIONS.TRANSFER;
        case CONFIRMED_ALLOCATION_TRADES_STATUS.TRANSFERRED:
          return null;
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
        // Just in case
        // this.sendRequest('/allocate', {});
        this.snackBar.open(
          'Allocate should be performed in Admin tab',
          'Close',
          {
            duration: 2000,
          }
        );
        break;
      case ACTIONS.TRANSFER:
        this.sendRequest(`/transfer`, {
          executionRef: e.blockTradeNum,
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
  }
}
