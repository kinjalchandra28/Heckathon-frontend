import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthActions, selectAuthLoading, selectAuthError } from '../../store';
import { LoginCredentials } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('shake', [
      transition('* => shake', [
        animate('100ms', style({ transform: 'translateX(-10px)' })),
        animate('100ms', style({ transform: 'translateX(10px)' })),
        animate('100ms', style({ transform: 'translateX(-10px)' })),
        animate('100ms', style({ transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class LoginComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  // Form model
  email = '';
  password = '';
  rememberMe = false;

  // Validation states
  emailTouched = false;
  passwordTouched = false;
  showPassword = false;

  // State from store
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);

  // Animation state
  shakeState = '';

  ngOnInit(): void {
    this.rememberMe = this.authService.isRemembered();

    this.error$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
      if (error) {
        this.triggerShake();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(AuthActions.clearError());
  }

  get emailError(): string | null {
    if (!this.emailTouched) return null;
    if (!this.email) return 'Email is required';
    if (!this.isValidEmail(this.email)) return 'Please enter a valid email';
    return null;
  }

  get passwordError(): string | null {
    if (!this.passwordTouched) return null;
    if (!this.password) return 'Password is required';
    if (this.password.length < 8) return 'Password must be at least 8 characters';
    return null;
  }

  get isFormValid(): boolean {
    return this.isValidEmail(this.email) && this.password.length >= 8;
  }

  onEmailBlur(): void {
    this.emailTouched = true;
  }

  onPasswordBlur(): void {
    this.passwordTouched = true;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.emailTouched = true;
    this.passwordTouched = true;

    if (!this.isFormValid) {
      this.triggerShake();
      return;
    }

    const credentials: LoginCredentials = {
      email: this.email,
      password: this.password,
      rememberMe: this.rememberMe,
    };

    this.store.dispatch(AuthActions.login({ credentials }));
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private triggerShake(): void {
    this.shakeState = 'shake';
    setTimeout(() => (this.shakeState = ''), 400);
  }
}
