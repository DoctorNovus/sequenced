import {
  AdMob,
  BannerAdSize,
  BannerAdPosition,
  BannerAdPluginEvents,
  AdmobConsentStatus,
  MaxAdContentRating
} from "@capacitor-community/admob";

import { Capacitor } from "@capacitor/core";

const adID = {
  ios: "ca-app-pub-8077676966001385/4881999812",
  android: "ca-app-pub-8077676966001385/3426637289",
};

export async function initializeAdMob() {
  const isIOS = Capacitor.getPlatform() == "ios";

  await AdMob.initialize({
    tagForChildDirectedTreatment: true,
    maxAdContentRating: MaxAdContentRating.General
  });

  const consentInfo = await AdMob.requestConsentInfo();
  if (consentInfo.isConsentFormAvailable && consentInfo.status == AdmobConsentStatus.REQUIRED) {
    await AdMob.showConsentForm();
  }

  AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info) => {
    const shell = document.querySelector("#root");
    const margin = parseInt(info.height, 10);

    if (margin == 0) shell.style.marginTop = "0px";

    if (margin > 0) {
        const safeAreaBottom = getComputedStyle(shell).getPropertyValue("--safe-area-inset-bottom");
        shell.style.marginTop = `calc(${margin}px - ${safeAreaBottom})`;
        shell.style.setProperty("--banner-ad-height", shell.style.marginTop);
    }
  });

  await AdMob.showBanner({
    adId: isIOS ? adID.ios : adID.android,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.TOP_CENTER,
    margin: 0,
    isTesting: false,
  });
}
