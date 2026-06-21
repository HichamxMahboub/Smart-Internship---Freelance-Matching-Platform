import { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { getAuth } from 'firebase/auth';
import { environment } from '../../../environments/environment';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const demoUser = localStorage.getItem('interlance_demo_user');
  if (demoUser) {
    const parsed = JSON.parse(demoUser);
    return next(req.clone({ setHeaders: { 'X-Demo-User-Email': parsed.email } }));
  }

  const user = getAuth().currentUser;
  if (!user) {
    return next(req);
  }

  return from(user.getIdToken()).pipe(
    switchMap((token) => next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })))
  );
};
