const config = {
  appId: "com.ottegi.sequenced-app",
  appName: "TidalTask",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
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

export default config;
