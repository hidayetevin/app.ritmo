import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/storage.service';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private storageService = inject(StorageService);
  t = inject(TranslationService);

  isDarkMode = () => this.storageService.settings().isDarkMode;
}
