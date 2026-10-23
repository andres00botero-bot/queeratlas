# Midnight Atlas trial — 2026-10-23

The original Evidence at every scale component is saved as
`HomeVenueIntelligence.original.js`. This snapshot includes the state immediately
before the Midnight Atlas trial. Keep both files if pushing the trial so the
original remains available after deployment or on another checkout.

Restore from the repository root in PowerShell:

```powershell
Copy-Item .design-backups/midnight-atlas/HomeVenueIntelligence.original.js src/components/home/HomeVenueIntelligence.js -Force
```

Then commit and push the restored component when ready to publish the rollback.
This restores only this section, preserving changes to city and venue cards.
