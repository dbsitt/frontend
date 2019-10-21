import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '../helperService';
import { USERNAMES } from '../blockchain.constants';

@Component({
  selector: 'app-execute-trade',
  templateUrl: './execute-trade.component.html',
  styleUrls: ['./execute-trade.component.scss'],
})
export class ExecuteTradeComponent implements OnInit {
  clients = ['Client1', 'Client2', 'Client3'];

  client = 'Client1';
  buySell = 'Buy';
  product = 'DH0371475458';
  quantity: number = null;
  price: number = null;
  tradeDate = '2019/10/16';
  eventDate = '2019/10/16';

  constructor(
    private httpClient: HttpClient,
    private helperService: HelperService
  ) {}

  ngOnInit() {}

  setSome(event) {
    console.log('te', event);
  }

  onValueChange(type, event) {
    console.log(type);
    const { value } = event.target;
    this[type] = value;
  }

  onSelectChange(type, event) {
    console.log(type);
    const { value } = event;
    this[type] = value;
  }

  onDateChange(type, event) {
    console.log(type);
    console.log(event);
  }

  onSubmit() {
    const {
      buySell,
      client,
      product,
      price,
      quantity,
      tradeDate,
      eventDate,
    } = this;
    const executingParty = this.helperService.getCurrentUserId();
    const counterParty =
      executingParty === USERNAMES.BROKER1
        ? USERNAMES.BROKER2
        : USERNAMES.BROKER1;

    console.log({
      client,
      executingParty,
      counterParty,
      buySell,
      product,
      price,
      quantity,
      tradeDate,
      eventDate,
    });
    // this.httpClient.post('book/blockTrade', {
    //   client,
    //   executingParty,
    //   counterParty,
    //   buySell,
    //   product,
    //   price,
    //   quantity,
    //   tradeDate,
    //   eventDate,
    // });
  }
}
