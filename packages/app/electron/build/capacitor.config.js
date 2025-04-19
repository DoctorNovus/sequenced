"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    appId: "com.ottegi.sequenced-app",
    appName: "Sequenced",
    webDir: "dist",
    server: {
        androidScheme: "https",
    },
};
const configElectron = {};
const configGlobal = Object.assign(Object.assign({}, config), { electron: configElectron, plugins: {
        LocalNotifications: {
            smallIcon: "icon",
            iconColor: "#307acf",
            sound: "beep.wav",
        },
    } });
exports.default = configGlobal;
