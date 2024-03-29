import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class APIInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const apiReq = req.clone();
    return next.handle(apiReq).pipe(
      catchError((err: any) => {
        let message;
        if (err.status === 0) {
          message = `Endpoint '${req.url}' not found`;
        } else if (err.status === 201) {
          if (typeof err.text === 'string') {
            message = err.text;
          } else if (typeof err.error.text === 'string') {
            message = err.error.text;
          } else {
            message = err;
          }
        } else if (err.status === 400) {
          if (typeof err.error === 'string') {
            message = err.error;
          } else if (typeof err.message === 'string') {
            message = err.message;
          } else {
            message = err;
          }
        } else if (err.status === 404) {
          if (typeof err.error === 'string') {
            message = err.error;
          } else {
            message = `Endpoint '${req.url}' not found`;
          }
        } else if (err.status === 500) {
          message = '500 Server Error';
        }
        this.snackBar.open(message, 'Close', {
          duration: 4000,
        });
        return throwError(err);
      })
    );
  }
}
