import { notarize } from '@electron/notarize';
import 'dotenv/config';

async function packageTask () {
  // Package your app here, and code sign with hardened runtime
  await notarize({
    appBundleId: "com.ottegi.sequenced-app",
    appPath: process.env.APP_PATH,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  });
}