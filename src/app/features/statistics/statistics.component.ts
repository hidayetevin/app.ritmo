import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/services/storage.service';
import { TranslationService } from '../../core/services/translation.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
    selector: 'app-statistics',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './statistics.component.html',
    styleUrl: './statistics.component.scss'
})
export class StatisticsComponent implements OnInit {
    private storageService = inject(StorageService);
    t = inject(TranslationService);

    routines = this.storageService.routines;

    // Global Stats
    totalRoutines = computed(() => this.routines().length);

    totalCompletions = computed(() => {
        return this.routines().reduce((acc, r) => acc + (r.completionHistory?.length || 0), 0);
    });

    bestRoutine = computed(() => {
        if (this.totalRoutines() === 0) return null;
        return [...this.routines()].sort((a, b) =>
            (b.completionHistory?.length || 0) - (a.completionHistory?.length || 0)
        )[0];
    });

    ngOnInit() {
        setTimeout(() => {
            this.initCharts();
        }, 100);
    }

    private initCharts() {
        const ctx = document.getElementById('completionChart') as HTMLCanvasElement;
        if (!ctx) return;

        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days.push(d.toISOString().split('T')[0]);
        }

        const dailyData = last7Days.map(date => {
            return this.routines().filter(r => r.completionHistory?.includes(date)).length;
        });

        const labels = last7Days.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString(this.t.currentLang() === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'short' });
        });

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: this.t.t('ROUTINES'),
                    data: dailyData,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#0d6efd'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });

        const pieCtx = document.getElementById('colorChart') as HTMLCanvasElement;
        if (pieCtx) {
            // Aktif olan tüm rutinleri al
            const activeData = this.routines()
                .filter(r => r.isActive !== false && (r.completionHistory?.length || 0) > 0) // Sadece aktif ve EN AZ 1 KERE tamamlanmışlar
                .map(r => ({
                    title: r.title,
                    count: r.completionHistory?.length || 0,
                    color: r.color
                }));

            // Eğer hiç veri yoksa (count toplamı 0 ise) grafik boş görünür.
            // Bu durumda 'Henüz Veri Yok' gibi bir şey göstermek lazım ama şimdilik tüm rutinleri gönderelim.

            if (activeData.length > 0) {
                new Chart(pieCtx, {
                    type: 'doughnut',
                    data: {
                        labels: activeData.map(d => d.title),
                        datasets: [{
                            data: activeData.map(d => d.count),
                            backgroundColor: activeData.map(d => d.color),
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    boxWidth: 12,
                                    usePointStyle: true,
                                    font: { size: 11 }
                                }
                            }
                        }
                    }
                });
            }
        }
    }
}
