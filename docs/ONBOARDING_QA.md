# Onboarding: Save & Coverage Areas (South Africa)

This document explains the minimal requirements to "Save and Continue" and how the new coverage area inputs work for South Africa, including rural locations.

## Minimal requirements to proceed
Protected modules (e.g., Dashboard, Delivery Services) are only available when your profile meets all three conditions:

1. `Full name` – either:
   - Provide `First name` and `Last name`, or
   - Fill `Full Name` under "Become a Delivery Service Provider".
2. `Contact` – at least one of:
   - A non-empty `Email` (either in Personal Emails or Provider Email), or
   - A non-empty `Phone number` (either in Phone Numbers or Provider Contact Number).
3. `Location consent` – enable the checkbox labeled:
   - "I agree to share my location while using safety features".

If any of these are missing, the Save button will be disabled.

## GPS handling
- When you grant location consent, the app attempts to capture a GPS fix and stores it with accuracy. An error is shown if GPS cannot be obtained; you can still continue after consenting.
- You can also press "Use Current GPS" when adding a coverage area. This will prefill the latitude/longitude in that entry.

## Coverage areas for South Africa
The coverage inputs now support the entire country, including rural areas.

- Select a `Province` from the national list (all 9 provinces).
- Enter a free-text `City/Town/Village`.
- Optionally add `Custom Area Notes` (e.g., ward/section/village name, landmarks).
- Optionally add `Latitude` and `Longitude` (or click "Use Current GPS").
- Click `Add Area` to add it to your profile. You can remove added areas individually.

This design avoids urban-only assumptions and supports precise rural service areas.

## Where the data is stored
- A normalized profile is persisted to IndexedDB for offline continuity.
- In-memory profile is updated so guarded routes unlock immediately after saving.

## Troubleshooting
- Save button disabled:
  - Check that you have a `Full name`, at least one `Email or Phone`, and you have ticked the `Location consent` checkbox.
- GPS errors:
  - Ensure location permissions are allowed in your browser.
  - Try toggling consent off/on and wait a few seconds for a GPS fix.
- Coverage area not added:
  - Ensure `Province` and `City/Town/Village` are filled before clicking `Add Area`.
