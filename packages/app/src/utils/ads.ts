import {
  AdMob,
  BannerAdSize,
  BannerAdPosition,
  BannerAdPluginEvents,
  AdmobConsentStatus,
  MaxAdContentRating,
  AdMobBannerSize,
} from "@capacitor-community/admob";

import { Capacitor } from "@capacitor/core";
import { Logger } from "./logger";

const adID = {
  ios: import.meta.env.VITE_IOS_AD_ID,
  android: import.meta.env.VITE_ANDROID_AD_ID,
};

/* Initializes the AdMob systems */
export async function initializeAdMob() {
  const isIOS = Capacitor.getPlatform() == "ios";

  await AdMob.initialize({
    tagForChildDirectedTreatment: true,
    maxAdContentRating: MaxAdContentRating.General,
  });

  const consentInfo = await AdMob.requestConsentInfo();
  if (
    consentInfo.isConsentFormAvailable &&
    consentInfo.status == AdmobConsentStatus.REQUIRED
  ) {
    await AdMob.showConsentForm();
  }

  AdMob.addListener(BannerAdPluginEvents.Opened, (info: AdMobBannerSize) => {
    Logger.log("AD INFO OPEN", info);
  });

  AdMob.addListener(
    BannerAdPluginEvents.SizeChanged,
    (info: AdMobBannerSize) => {
      const root = document.querySelector<HTMLElement>("#root");
      
      const shell = document.querySelector<HTMLElement>(
        "#unit-container"
      ) as HTMLElement;
      const margin = info.height;

      if (margin == 0) shell.style.marginTop = "0px";

      if (margin > 0) {
        const safeAreaTop = getComputedStyle(shell).getPropertyValue(
          "--safe-area-inset-top"
        );
        const safeAreaBottom = getComputedStyle(shell).getPropertyValue(
          "--safe-area-inset-bottom"
        );

        Logger.log("SAT", safeAreaTop);
        Logger.log("SAB", safeAreaBottom);

        shell.style.marginTop = `${margin}px`;
        shell.style.setProperty("--banner-ad-height", shell.style.marginTop);
      }
    }
  );

  await AdMob.showBanner({
    adId: isIOS ? adID.ios : adID.android,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.TOP_CENTER,
    margin: 0,
    isTesting: false,
  });
}
