import { CapacitorElectronConfig } from "@capacitor-community/electron";

const config = {
  appId: "com.ottegi.sequenced-app",
  appName: "Sequenced",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

const configElectron = {};

const configGlobal: CapacitorElectronConfig = {
  ...config,
  electron: configElectron,
  plugins: {
    LocalNotifications: {
      smallIcon: "icon",
      iconColor: "#307acf",
      sound: "beep.wav",
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default configGlobal;
