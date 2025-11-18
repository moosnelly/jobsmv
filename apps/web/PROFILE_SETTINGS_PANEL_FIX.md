# Profile Settings Panel Fix

## Issue
When clicking the settings icon in the main header, the ProfileSettingsPanel would not render. The backdrop/overlay would appear (showing a blur effect), but the panel itself was not visible on screen.

## Root Cause
The issue was caused by improper z-index layering in the `SlideInPanel` component:

1. **Backdrop z-index**: Was set to `z-50` (standard Tailwind value)
2. **Panel z-index**: Was set to `z-[60]` (arbitrary Tailwind value)

While Tailwind v4 supports arbitrary values like `z-[60]`, there can be issues with:
- Z-index stacking contexts in nested components
- Tailwind JIT compilation not properly generating arbitrary z-index values
- Browser rendering quirks with non-standard z-index values

Additionally, the ProfileSettingsPanel had an early return statement (`if (!isOpen) return null;`) that prevented proper AnimatePresence exit animations.

## Solution

### 1. Fixed z-index Values in SlideInPanel.tsx
Changed to use standard, well-supported z-index values:
- **Backdrop**: Changed from `z-50` to `z-40`
- **Panel**: Changed from `z-[60]` to `z-50`

This ensures:
- Both use standard Tailwind z-index classes
- Clear hierarchy: backdrop (z-40) < panel (z-50)
- Better browser compatibility
- Consistent with other modal/overlay patterns in the codebase

### 2. Removed Early Return in ProfileSettingsPanel.tsx
Removed the `if (!isOpen) return null;` statement to allow framer-motion's `AnimatePresence` to properly handle mounting/unmounting and animations.

### 3. Added Test ID for Reliability
Added `panelTestId` prop to SlideInPanel component with:
- Default value: `"slide-in-panel"`
- ProfileSettingsPanel uses: `"profile-settings-panel"`
- Enables reliable E2E and integration testing

## Files Changed

### `packages/ui-tripled/src/SlideInPanel.tsx`
- Updated z-index values (backdrop: z-40, panel: z-50)
- Added `panelTestId` prop for testing
- Added `data-testid` attribute to panel element

### `apps/web/src/components/ProfileSettingsPanel.tsx`
- Removed early return statement
- Added `panelTestId="profile-settings-panel"` prop
- Now properly integrates with AnimatePresence for smooth animations

## Testing

To verify the fix:

1. **Manual Testing**:
   - Navigate to the home page or jobs page
   - Ensure you're authenticated (settings icon only shows when logged in)
   - Click the settings icon in the header
   - **Expected**: ProfileSettingsPanel slides in from the right with backdrop blur
   - Click the close button, backdrop, or press Escape
   - **Expected**: Panel slides out smoothly

2. **Automated Testing** (if test framework is configured):
   ```typescript
   // Check panel opens
   await page.click('[aria-label="Settings"]');
   await expect(page.locator('[data-testid="profile-settings-panel"]')).toBeVisible();
   
   // Check backdrop is present
   await expect(page.locator('.bg-black\\/50')).toBeVisible();
   
   // Check panel closes
   await page.click('[aria-label="Close panel"]');
   await expect(page.locator('[data-testid="profile-settings-panel"]')).not.toBeVisible();
   ```

## Additional Notes

### Z-Index Hierarchy in the App
- Base content: z-0 to z-10
- Sticky headers: z-20 to z-30
- Overlays/Backdrops: z-40
- Modals/Panels: z-50
- Tooltips/Popovers: (reserved for future use)

### Best Practices for Overlays
1. Always use standard Tailwind z-index values when possible
2. Let AnimatePresence handle mounting/unmounting
3. Don't add early returns in components that use AnimatePresence
4. Use portals for overlays if stacking context issues arise (not needed here)
5. Add data-testid attributes for reliable testing

## Related Components
- `SlideInPanel` (packages/ui-tripled/src/SlideInPanel.tsx)
- `ProfileSettingsPanel` (apps/web/src/components/ProfileSettingsPanel.tsx)
- `Modal` (packages/ui-tripled/src/Modal.tsx) - similar pattern
- HomePage (apps/web/src/app/page.tsx) - uses ProfileSettingsPanel
- JobsPageClient (apps/web/src/app/(public)/jobs/JobsPageClient.tsx) - uses ProfileSettingsPanel
