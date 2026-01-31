import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  storage = inject(StorageService);

  toggleDarkMode(val: boolean) {
    this.storage.updateSettings({ isDarkMode: val });
    // TODO: Apply class to body
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
