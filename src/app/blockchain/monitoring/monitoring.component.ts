import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss'],
})
export class MonitoringComponent implements OnInit {
  currentStep = null;
  constructor(private router: Router) {}

  ngOnInit() {}

  switchView(step) {
    this.currentStep = step;
  }
}
