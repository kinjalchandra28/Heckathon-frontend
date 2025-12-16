import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Models } from 'appwrite';
import { AppwriteService } from './appwrite.service';
import { User, LoginCredentials, RegisterCredentials } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private appwrite = inject(AppwriteService);

  private readonly REMEMBER_ME_KEY = 'auth_remember_me';

  login(credentials: LoginCredentials): Observable<User> {
    return this.appwrite.createEmailSession(credentials.email, credentials.password).pipe(
      switchMap(() => this.getCurrentUser()),
      map((user) => {
        if (credentials.rememberMe) {
          localStorage.setItem(this.REMEMBER_ME_KEY, 'true');
        } else {
          sessionStorage.setItem(this.REMEMBER_ME_KEY, 'true');
        }
        return user;
      })
    );
  }

  register(credentials: RegisterCredentials): Observable<User> {
    return this.appwrite.createAccount(credentials.email, credentials.password, credentials.name).pipe(
      switchMap(() =>
        this.appwrite.createEmailSession(credentials.email, credentials.password)
      ),
      switchMap(() => this.getCurrentUser())
    );
  }

  logout(): Observable<void> {
    localStorage.removeItem(this.REMEMBER_ME_KEY);
    sessionStorage.removeItem(this.REMEMBER_ME_KEY);
    return this.appwrite.deleteSession();
  }

  getCurrentUser(): Observable<User> {
    return this.appwrite.getCurrentUser().pipe(map((user) => this.mapAppwriteUserToUser(user)));
  }

  checkSession(): Observable<User | null> {
    return this.appwrite.getSession().pipe(
      switchMap(() => this.getCurrentUser()),
      catchError(() => of(null))
    );
  }

  isRemembered(): boolean {
    return localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';
  }

  private mapAppwriteUserToUser(appwriteUser: Models.User<Models.Preferences>): User {
    return {
      $id: appwriteUser.$id,
      email: appwriteUser.email,
      name: appwriteUser.name,
      emailVerification: appwriteUser.emailVerification,
      prefs: appwriteUser.prefs,
      $createdAt: appwriteUser.$createdAt,
      $updatedAt: appwriteUser.$updatedAt,
    };
  }
}
