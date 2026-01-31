import { Injectable } from '@angular/core';
import {
    AdMob,
    BannerAdOptions,
    BannerAdSize,
    BannerAdPosition,
    RewardAdOptions
} from '@capacitor-community/admob';

@Injectable({
    providedIn: 'root'
})
export class AdService {
    private bannerId = 'ca-app-pub-4190858087915294/1439697722';
    private rewardedId = 'ca-app-pub-4190858087915294/9976663290';

    private transitionCount = 0;

    constructor() {
        this.initialize();
    }

    async initialize() {
        await AdMob.initialize({
            // requestTrackingAuthorization might be handled separately in newer versions
        });
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
            const options: RewardAdOptions = {
                adId: this.rewardedId,
                isTesting: false
            };

            await AdMob.prepareRewardVideoAd(options);
            const reward = await AdMob.showRewardVideoAd();
            console.log('Reward earned:', reward);
            return reward;
        } catch (error) {
            console.error('Rewarded ad error:', error);
            return null;
        }
    }

    handleMenuTransition() {
        this.transitionCount++;
        console.log('Menu transition count:', this.transitionCount);
        // User wants every 3 transitions
        if (this.transitionCount % 3 === 0) {
            this.showRewardedAd();
        }
    }
}
