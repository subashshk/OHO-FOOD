import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { KeyFormatterService } from 'src/app/services/key-formatter.service';

@Injectable()
export class FormatterInteceptor implements HttpInterceptor {
  constructor(private keyFormatter: KeyFormatterService) {}

  // function which will be called for all http calls
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!(request.body instanceof FormData)) {
      const snakeCaseObject = this.keyFormatter.convertKeys(request.body, 'snake');
      request = request.clone({ body: snakeCaseObject });
    }

    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const camelCaseObject = this.keyFormatter.convertKeys(event.body, 'camel');
          event = event.clone({ body: camelCaseObject });
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        let obj = { ...error };
        const camelCaseObject = this.keyFormatter.convertKeys(obj.error, 'camel');
        obj.error = camelCaseObject;
        return throwError(obj);
      })
    );
  }
}
