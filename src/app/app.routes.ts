import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            {
                path: 'home',
                loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
            },
            {
                path: 'routines',
                loadComponent: () => import('./features/routines/routine-list/routine-list.component').then(m => m.RoutineListComponent)
            },
            {
                path: 'calendar',
                loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent)
            },
            {
                path: 'settings',
                loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
            },
            {
                path: 'statistics',
                loadComponent: () => import('./features/statistics/statistics.component').then(m => m.StatisticsComponent)
            }
        ]
    }
];
