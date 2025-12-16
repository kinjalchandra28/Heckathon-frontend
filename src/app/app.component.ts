import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, distinctUntilChanged } from 'rxjs/operators';
import { SidePanelComponent } from './shared/side-panel/side-panel.component';
import { AuthActions, selectIsAuthenticated, selectSessionChecked } from './store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidePanelComponent],
})
export class AppComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  isAuthenticated$ = this.store.select(selectIsAuthenticated);
  sessionChecked$ = this.store.select(selectSessionChecked);

  isLoginPage$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map((event) => event.url === '/login' || event.url.startsWith('/login?')),
    distinctUntilChanged()
  );

  ngOnInit(): void {
    this.store.dispatch(AuthActions.checkSession());
  }
}
