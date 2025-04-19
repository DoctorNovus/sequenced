const { signAsync } = require('@electron/osx-sign');
signAsync({
    app: '../electron/release/mas-universal/Sequenced.app',
    provisioningProfile: '../build/Sequenced.appembedded.provisionprofile'
});
