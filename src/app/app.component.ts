import { Component, effect, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { StorageService } from './core/services/storage.service';
import { AdService } from './core/services/ad.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private storageService = inject(StorageService);
  private adService = inject(AdService);
  private router = inject(Router);

  constructor() {
    // Watch for dark mode changes
    effect(() => {
      const isDark = this.storageService.settings().isDarkMode;
      if (isDark) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    });

    // Track menu transitions
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.adService.handleMenuTransition();
    });
  }

  ngOnInit() {
    this.adService.showBanner();
  }
}
