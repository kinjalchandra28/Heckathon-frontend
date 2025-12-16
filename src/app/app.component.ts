import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidePanelComponent } from './shared/side-panel/side-panel.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet, SidePanelComponent]
})
export class AppComponent {}
