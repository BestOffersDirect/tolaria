# Release Channels

Tolaria publishes Stable and Alpha release metadata to GitHub Pages.

## Stable

Stable follows manually promoted releases. This is the right channel for normal use.

The stable updater metadata lives at:

```txt
/stable/latest.json
```

The public download page points at the latest stable release.

## Alpha

Alpha follows pushes to `main`. It receives fixes and features earlier, but it can be rougher than Stable. Desktop updates pull from the alpha metadata automatically, and mobile apps on the Alpha channel receive over-the-air (OTA) updates automatically.

The alpha updater metadata lives at:

```txt
/alpha/latest.json
```

Compatibility endpoints also point to the alpha metadata:

```txt
/latest.json
/latest-canary.json
```

## Mobile Channels

The iOS app (iPhone and iPad) includes settings to switch between **Stable** and **Alpha** channels. The selected channel controls which OTA updates the app receives. Mobile Alpha follows desktop Alpha but updates independently through Expo's update service.

## Before Switching

Commit or push important vault changes before changing release channel or installing an update. Your notes are local files, but a clean Git state makes recovery simpler.
