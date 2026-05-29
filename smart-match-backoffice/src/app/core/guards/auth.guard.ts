import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { filter, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ready$.pipe(
    filter(Boolean),
    take(1),
    map(() => auth.currentUser ? true : router.createUrlTree(['/login']))
  );
};
