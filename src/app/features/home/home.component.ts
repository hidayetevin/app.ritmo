import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  storage = inject(StorageService);

  today = new Date();

  // Computed or simple getter for count
  get activeRoutinesCount() {
    return this.storage.routines().filter(r => r.isActive).length;
  }
}
