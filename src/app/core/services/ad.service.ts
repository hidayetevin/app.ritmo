import { Injectable } from '@angular/core';
import {
    AdMob,
    BannerAdOptions,
    BannerAdSize,
    BannerAdPosition,
    RewardAdOptions,
    RewardAdPluginEvents,
    AdLoadInfo
} from '@capacitor-community/admob';

@Injectable({
    providedIn: 'root'
})
export class AdService {
    private bannerId = 'ca-app-pub-4190858087915294/1439697722';
    private rewardedId = 'ca-app-pub-4190858087915294/9976663290';

    private transitionCount = 0;
    private isRewardedAdReady = false;
    private isPreloading = false;

    constructor() {
        this.setupListeners();
        this.initialize();
    }

    // Dinleyicileri kur: Reklam yüklendiğinde veya kapandığında ne yapacağını bilir.
    private setupListeners() {
        // Reklam başarıyla yüklendiğinde
        AdMob.addListener(RewardAdPluginEvents.Loaded, (info: AdLoadInfo) => {
            console.log('✅ Ödüllü Reklam Hafızaya Alındı:', info);
            this.isRewardedAdReady = true;
            this.isPreloading = false;
        });

        // Reklam kapatıldığında veya ödül alındığında
        AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
            console.log('🔄 Reklam kapatıldı, yenisi çekiliyor...');
            this.isRewardedAdReady = false;
            this.preloadRewardedAd(); // Hemen yenisini çek
        });

        // Reklam yükleme hatası aldığında
        AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error) => {
            console.error('❌ Reklam yüklenemedi:', error);
            this.isRewardedAdReady = false;
            this.isPreloading = false;
            // 10 saniye sonra tekrar dene
            setTimeout(() => this.preloadRewardedAd(), 10000);
        });
    }

    async initialize() {
        try {
            await AdMob.initialize({});
            this.preloadRewardedAd();
        } catch (e) {
            console.error('AdMob init error:', e);
        }
    }

    async preloadRewardedAd() {
        if (this.isRewardedAdReady || this.isPreloading) return;

        this.isPreloading = true;
        try {
            const options: RewardAdOptions = {
                adId: this.rewardedId,
                isTesting: false
            };
            // Sadece 'prepare' diyoruz, 'show' demiyoruz. 
            // Arka planda indirme başlar.
            await AdMob.prepareRewardVideoAd(options);
        } catch (error) {
            this.isPreloading = false;
            console.error('Preload call failed:', error);
        }
    }

    async showRewardedAd() {
        // Eğer reklam hazırsa saniyesinde gösterilir.
        if (this.isRewardedAdReady) {
            try {
                const reward = await AdMob.showRewardVideoAd();
                return reward;
            } catch (e) {
                console.error('Show failed:', e);
                this.preloadRewardedAd();
                return null;
            }
        } else {
            // Reklam hazır değilse (yükleniyorsa veya internet yoksa)
            // Kullanıcıyı bekletmemek için hemen normal akışa dönüyoruz.
            console.log('⚠️ Reklam henüz hazır değil, akış devam ediyor...');
            if (!this.isPreloading) this.preloadRewardedAd();
            return null;
        }
    }

    async showBanner() {
        try {
            const options: BannerAdOptions = {
                adId: this.bannerId,
                adSize: BannerAdSize.ADAPTIVE_BANNER,
                position: BannerAdPosition.TOP_CENTER,
                margin: 56, // Header'ın altında
                isTesting: false
            };
            await AdMob.showBanner(options);
        } catch (e) {
            console.error('Show banner error:', e);
        }
    }

    async hideBanner() {
        try {
            await AdMob.removeBanner();
        } catch (e) {
            console.error('Hide banner error:', e);
        }
    }

    handleMenuTransition() {
        this.transitionCount++;
        if (this.transitionCount % 5 === 0) {
            this.showRewardedAd();
        }
    }
}
