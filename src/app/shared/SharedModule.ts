import { NgModule } from '@angular/core';
import { HelperService } from '../blockchain/helperService';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [HelperService],
})
export class SharedModule {}
