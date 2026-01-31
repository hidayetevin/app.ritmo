import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/storage.service';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  storage = inject(StorageService);
  t = inject(TranslationService);

  changeLanguage(lang: any) {
    this.storage.updateSettings({ language: lang });
  }

  toggleDarkMode(val: boolean) {
    this.storage.updateSettings({ isDarkMode: val });
  }

  toggleNotifications(val: boolean) {
    this.storage.updateSettings({ notificationsEnabled: val });
  }

  toggleSound(val: boolean) {
    this.storage.updateSettings({ soundEnabled: val });
  }

  toggleVibration(val: boolean) {
    this.storage.updateSettings({ vibrationEnabled: val });
  }
}
