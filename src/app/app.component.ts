import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StorageService } from './core/services/storage.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private storageService = inject(StorageService);

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
  }
}
