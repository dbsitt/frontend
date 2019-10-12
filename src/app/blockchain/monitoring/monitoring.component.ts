import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss'],
})
export class MonitoringComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  navigateToUrl(url) {
    this.router.navigateByUrl(url);
  }
}
