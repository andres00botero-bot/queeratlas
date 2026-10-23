# Atlas pulse design trial — 2026-10-23

Original component saved before changing Happening across the atlas.

Restore from the repository root in PowerShell:

```powershell
Copy-Item .design-backups/atlas-pulse/HomeDeferredSections.original.js src/components/home/HomeDeferredSections.js -Force
```

The added home.atlasUpdates translation can remain unused after restoration.
The Evidence section is a separate component and is not changed by this rollback.
