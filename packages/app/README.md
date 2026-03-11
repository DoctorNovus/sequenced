# Build Instructions (IOS)
1. `npm i` - Installs needed packages
2. `npx cap add ios` - Add your builds
3. `npm run resources` - Compiles images for mobile build
4. `npm run open:ios:full` - Runs `npm run build:full` and `npm run open:ios` to open the project in XCode.
5. Compile in Xcode

# App Store Connect Upload (Auto Build Number)
Use this to upload directly to App Store Connect and auto-increment build numbers based on current Xcode marketing version (`MARKETING_VERSION`).

## One-time setup
1. Create an App Store Connect API key (`.p8`) with app upload permissions.
2. Set environment variables (either export in shell or create `packages/app/.env.asc.local`):
   - `ASC_KEY_ID`
   - `ASC_ISSUER_ID`
   - `ASC_KEY_CONTENT` (base64 of the `.p8` file) OR `ASC_KEY_PATH` (absolute path to `.p8`)
   - Optional: `APP_IDENTIFIER` (defaults to `com.ottegi.sequenced-app`)

Example:

```bash
export ASC_KEY_ID="YOUR_KEY_ID"
export ASC_ISSUER_ID="YOUR_ISSUER_ID"
export ASC_KEY_CONTENT="$(base64 < /path/to/AuthKey_ABC123XYZ.p8 | tr -d '\n')"
# or:
# export ASC_KEY_PATH="/absolute/path/to/AuthKey_ABC123XYZ.p8"
export APP_IDENTIFIER="com.ottegi.sequenced-app"
```

Example `.env.asc.local`:

```bash
ASC_KEY_ID=YOUR_KEY_ID
ASC_ISSUER_ID=YOUR_ISSUER_ID
ASC_KEY_PATH=/absolute/path/to/AuthKey_ABC123XYZ.p8
APP_IDENTIFIER=com.ottegi.sequenced-app
```

## Upload command
```bash
npm run upload:ios:asc
```

What this does:
1. Builds/syncs Capacitor assets.
2. Reads current iOS project version (e.g. `3.0.0`).
3. Fetches latest TestFlight build for that version from App Store Connect.
4. Increments `CURRENT_PROJECT_VERSION` (`1 -> 2 -> 3 ...`).
5. Archives and uploads to App Store Connect.

## Upload + submit for App Review
```bash
npm run release:ios:asc
```

What this does:
1. Performs the same build/upload flow as `upload:ios:asc`.
2. Waits for App Store Connect processing.
3. Submits the uploaded build for App Review.

Notes:
- This lane uses existing App Store Connect app metadata/screenshots (`skip_metadata` + `skip_screenshots`).
- Release is set to manual (`automatic_release: false`) so you control production release timing in App Store Connect.
- Bundler gems are installed to `ios/App/vendor/bundle` automatically by the npm scripts (no system Ruby sudo needed).
