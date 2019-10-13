import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class APIInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const { api } = environment;
    const apiReq = req.clone({ url: `${api}/${req.url}` });
    return next.handle(apiReq).pipe(
      catchError((err: HttpErrorResponse) => {
        let message = `Status ${err.status}. ${err.statusText}`;
        if (err.status === 0) {
          message = `Endpoint '${api}/${req.url}' not found`;
        } else if (err.status === 404) {
          message = `404 Error`;
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
