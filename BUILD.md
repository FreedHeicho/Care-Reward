# Care Reward - Android APK Build

## Building the APK

The Android APK is built automatically via GitHub Actions.

### Trigger a Build

Go to **Actions > Android APK Build > Run workflow** to trigger a manual build.

The workflow will:
1. Install dependencies with pnpm
2. Generate a debug keystore
3. Run Expo prebuild for Android
4. Compile the APK with Gradle
5. Upload the APK as an artifact

### Download the APK

After the workflow completes, download the APK from the Artifacts section.
