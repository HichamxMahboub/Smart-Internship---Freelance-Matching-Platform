import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, User as FirebaseUser, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { BehaviorSubject, Observable, catchError, from, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, Role } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(environment.firebaseConfig);
  private readonly auth: Auth = getAuth(this.app);
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly demoUserStorageKey = 'interlance_demo_user';
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  private readonly readySubject = new BehaviorSubject(false);

  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly ready$ = this.readySubject.asObservable();

  constructor() {
    const demoUser = localStorage.getItem(this.demoUserStorageKey);
    if (demoUser) {
      this.currentUserSubject.next(JSON.parse(demoUser));
      this.readySubject.next(true);
      return;
    }

    onAuthStateChanged(this.auth, (firebaseUser) => {
      if (!firebaseUser) {
        localStorage.removeItem(this.demoUserStorageKey);
        this.currentUserSubject.next(null);
        this.readySubject.next(true);
        return;
      }
      this.loadBackendUser().subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
          this.readySubject.next(true);
        },
        error: () => {
          localStorage.removeItem(this.demoUserStorageKey);
        this.currentUserSubject.next(null);
          this.readySubject.next(true);
        }
      });
    });
  }

  login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    if (['admin@interlance.demo', 'recruiter@interlance.demo'].includes(normalizedEmail)) {
      const user: User = {
        id: normalizedEmail.startsWith('admin') ? 'seed-admin-uid' : 'seed-recruiter-uid',
        firebaseUid: normalizedEmail.startsWith('admin') ? 'seed-admin-uid' : 'seed-recruiter-uid',
        fullName: normalizedEmail.startsWith('admin') ? 'Admin Interlance' : 'Recruiter Interlance',
        email: normalizedEmail,
        role: normalizedEmail.startsWith('admin') ? 'ADMIN' : 'RECRUITER',
        plan: normalizedEmail.startsWith('admin') ? 'PREMIUM' : 'FREE',
        active: true,
        emailVerified: true
      };
      localStorage.setItem(this.demoUserStorageKey, JSON.stringify(user));
      this.currentUserSubject.next(user);
      return of(user);
    }

    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(() => this.loadBackendUser()),
      tap((user) => this.currentUserSubject.next(user))
    );
  }

  logout() {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        localStorage.removeItem(this.demoUserStorageKey);
        this.currentUserSubject.next(null);
        this.router.navigateByUrl('/login');
      })
    );
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get firebaseUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  hasRole(roles: Role[]) {
    const role = this.currentUser?.role;
    return !!role && roles.includes(role);
  }

  redirectAfterLogin(user = this.currentUser) {
    if (!user) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.router.navigateByUrl('/dashboard');
  }

  private loadBackendUser(): Observable<User> {
    return this.http.get<User>(`${this.apiBaseUrl}/auth/me`).pipe(
      catchError(() => this.http.get<User>(`${this.apiBaseUrl}/users/me`))
    );
  }

  waitUntilReady() {
    return this.ready$.pipe(
      map((ready) => ready && !!this.currentUserSubject.value)
    );
  }
}
