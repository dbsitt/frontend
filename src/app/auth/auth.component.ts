import { Component, OnInit } from '@angular/core';
import { USERNAMES } from '../blockchain/blockchain.constants';
import { HelperService } from '../blockchain/helperService';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  USERNAMES = USERNAMES;

  userId = 'Broker1';

  constructor(private helperService: HelperService) {}

  onUserChange(event) {
    const { value } = event.target;
    this.userId = value;
  }

  login() {
    this.helperService.setUser(this.userId);
  }
  ngOnInit() {}
}
