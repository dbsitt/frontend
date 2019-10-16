import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-transfer-info',
  templateUrl: './transfer-info.component.html',
  styleUrls: ['./transfer-info.component.scss'],
})
export class TransferInfoComponent implements OnInit {
  @Input() data;

  constructor() {}

  ngOnInit() {}
}
