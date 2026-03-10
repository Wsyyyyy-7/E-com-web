# CreatorBridge - Marketplace Redesign

## Design Guidelines
- **Style**: Clean marketplace with indigo/sky accent colors
- **Primary**: #4F46E5 (Indigo-600)
- **Secondary**: #0284C7 (Sky-600)
- **Background**: #F9FAFB (Gray-50)
- **Cards**: White with subtle shadows
- **Typography**: System default (Inter via Tailwind)

## Files to Create/Modify

1. **src/components/Navbar.tsx** — Shared top navigation bar with logo, links (广场/Marketplace, 达人目录/Creators, 商家/Merchants), login/register buttons
2. **src/pages/Index.tsx** — REWRITE: Marketplace homepage showing all campaigns as product cards, with search/filter, no login required
3. **src/pages/CreatorDirectory.tsx** — NEW: Browse creator profiles with filters (country, category, trust tier), uses `queryAll` on user_profiles where role=creator
4. **src/pages/MerchantProfile.tsx** — NEW: View a merchant's public profile and campaign history, uses `queryAll` on campaigns
5. **src/App.tsx** — UPDATE: Add new routes for /creators and /merchants
6. **src/pages/CreatorStudio.tsx** — Minor update: add Navbar import
7. **src/pages/MerchantDashboard.tsx** — Minor update: add Navbar import

## Implementation Notes
- All public pages use `queryAll` to fetch data from all users
- user_profiles with role='creator' → creator directory (create_only=true, so use queryAll)
- user_profiles with role='merchant' → merchant profiles
- campaigns → marketplace (create_only=true, so use queryAll)
- No login required for browsing marketplace, creator directory, or merchant profiles
- Keep existing MerchantDashboard and CreatorStudio pages intact (just add Navbar)