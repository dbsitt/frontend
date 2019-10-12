import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotFoundComponent } from '../not-found/not-found.component';
import { AuthComponent } from '../auth/auth.component';

const routes: Routes = [
  {
    path: 'transactions',
    loadChildren: '../blockchain/blockchain.module#BlockchainModule',
  },
  {
    path: 'auth',
    component: AuthComponent,
  },
  {
    path: '',
    redirectTo: '/transactions',
    pathMatch: 'full',
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
