import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { AuthAction, loginSuccessful, logoutSuccessful } from './auth.actions';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthAction.loginStarted),
      map((props: { user: string; password: string }) =>
        loginSuccessful({ userToken: props.user + props.password })
      ),
      tap(() => {
        this.router.navigateByUrl('/');
      })
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthAction.logoutStarted),
      map(logoutSuccessful)
    )
  );

  constructor(private actions$: Actions, private router: Router) {}
}
