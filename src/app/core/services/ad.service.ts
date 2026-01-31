import { Injectable } from '@angular/core';
import {
    AdMob,
    BannerAdOptions,
    BannerAdSize,
    BannerAdPosition,
    RewardAdOptions,
    AdMobError
} from '@capacitor-community/admob';

@Injectable({
    providedIn: 'root'
})
export class AdService {
    private bannerId = 'ca-app-pub-4190858087915294/1439697722';
    private rewardedId = 'ca-app-pub-4190858087915294/9976663290';

    private transitionCount = 0;
    private isRewardedAdLoaded = false;

    constructor() {
        this.initialize();
    }

    async initialize() {
        await AdMob.initialize({});
        // Uygulama açılır açılmaz ilk reklamı arka planda yükle
        this.preloadRewardedAd();
    }

    // Reklamı arka planda hazırlayan fonksiyon
    async preloadRewardedAd() {
        try {
            const options: RewardAdOptions = {
                adId: this.rewardedId,
                isTesting: false
            };
            await AdMob.prepareRewardVideoAd(options);
            this.isRewardedAdLoaded = true;
            console.log('Rewarded ad preloaded and ready.');
        } catch (error) {
            console.error('Failed to preload rewarded ad:', error);
            this.isRewardedAdLoaded = false;
        }
    }

    async showBanner() {
        const options: BannerAdOptions = {
            adId: this.bannerId,
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.TOP_CENTER,
            margin: 0,
            isTesting: false
        };
        await AdMob.showBanner(options);
    }

    async hideBanner() {
        await AdMob.removeBanner();
    }

    async showRewardedAd() {
        try {
            // Eğer önceden yüklendiyse direkt göster (Anında açılır)
            if (this.isRewardedAdLoaded) {
                const reward = await AdMob.showRewardVideoAd();
                this.isRewardedAdLoaded = false;
                this.preloadRewardedAd(); // Bir sonraki kullanım için hemen yenisini yükle
                return reward;
            } else {
                // Yüklenmemişse (nadiren olur), hızlıca yükleyip göstermeyi dene
                console.log('Ad not preloaded, loading now...');
                const options: RewardAdOptions = {
                    adId: this.rewardedId,
                    isTesting: false
                };
                await AdMob.prepareRewardVideoAd(options);
                const reward = await AdMob.showRewardVideoAd();
                this.preloadRewardedAd();
                return reward;
            }
        } catch (error) {
            console.error('Rewarded ad show error:', error);
            this.preloadRewardedAd(); // Hata olsa bile bir sonrakini yüklemeye çalış
            return null;
        }
    }

    handleMenuTransition() {
        this.transitionCount++;
        if (this.transitionCount % 3 === 0) {
            this.showRewardedAd();
        }
    }
}
