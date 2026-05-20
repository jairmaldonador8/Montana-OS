# Research Brief: Montana OS Design System Implementation
**Date:** 2026-05-20  
**Topic:** Design system with Tailwind v4, React components, animations, and real estate CRM patterns  
**Research Scope:** Current state of art for design systems, accessible components, animations, and dashboard patterns in 2025-2026

---

## Context

Montana OS is being completely redesigned with a "Dynamic and Energetic" design system (white + vibrant yellow #FBBF24, Poppins typography, rounded borders, micro-interactions). The implementation will use React, Next.js, and Tailwind CSS. This research validates the tooling choices and best practices for building a scalable, accessible, production-ready design system.

---

## Key Findings

### 1. Design System Architecture with Tailwind CSS v4

**Finding:** Tailwind CSS v4 (released January 2025) fundamentally changed design token management from JavaScript to CSS-first configuration.

**Details:**
- **@theme directive**: Design tokens declared directly in CSS, not `tailwind.config.js`
- **CSS Variables**: All tokens automatically available as CSS variables for runtime access
- **Performance**: Full builds 5x faster, incremental builds 100x+ faster (now in microseconds) due to new Rust-based engine
- **Token Layers**: Structure tokens in 3 layers:
  - **Base tokens**: Raw palette values (no semantic meaning)
  - **Semantic tokens**: Purpose-driven tokens (e.g., `--color-primary`, `--color-success`)
  - **Component tokens**: Component-specific variants
- **OKLCH Color Format**: Adopt OKLCH instead of HSL/hex for perceptually uniform color scales

**Montana OS Application:**
```css
@theme {
  --color-primary: oklch(85% 0.2 60);        /* Vibrant yellow */
  --color-primary-light: oklch(95% 0.1 60);  /* Light yellow */
  --color-background: oklch(100% 0 60);      /* White */
  --color-text: oklch(15% 0.1 260);         /* Dark gray */
  --color-success: oklch(65% 0.15 142);      /* Green */
  --color-error: oklch(60% 0.22 27);         /* Red */
  
  --font-family-sans: "Poppins", sans-serif;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 1rem;
  --border-radius-full: 24px;
  
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
}
```

**Recommendation:** Use Tailwind v4 CSS-first configuration. Define all design tokens as CSS variables that map to utilities. This ensures consistency, enables runtime theming, and keeps the codebase maintainable.

---

### 2. Accessible Component Architecture

**Finding:** shadcn/ui (with Radix UI + Tailwind) is the production standard for WCAG 2.1 AA compliant React components in 2025.

**Details:**
- **Copy-paste model**: Components copied into the project (not npm dependency), so you own the code
- **Built on Radix UI**: Accessibility primitives for keyboard navigation, ARIA attributes, focus management
- **WCAG 2.1 AA compliance**: Out-of-the-box with correct semantic HTML, ARIA roles, focus indicators
- **Zero JS overhead**: Tailwind purges unused CSS at build time (5-15KB production CSS vs 100KB+ for Material-UI)
- **Key accessibility requirements**:
  - Keyboard access for all interactive elements
  - Focus indicators with 3:1 contrast ratio minimum
  - Touch targets at least 24x24 pixels
  - Form inputs paired with visible labels or `aria-label`
  - Error messages connected via `aria-describedby`

**Montana OS Application:**
```
Project structure:
├── src/components/
│   ├── ui/                    # shadcn/ui copy-paste components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── shared/                # Custom wrappers & compound components
│   │   ├── PropertyCard.tsx   # Custom Montana OS component
│   │   ├── Navbar.tsx
│   │   └── ...
│   └── forms/
│       └── PropertyForm.tsx
```

**Recommendation:** Initialize shadcn/ui in the project. Use it as the foundation for all base components (buttons, inputs, cards, dialogs). Build Montana OS custom components on top of shadcn primitives. This guarantees accessibility compliance and reduces maintenance burden.

**Implementation Note:** Use `cn()` utility from `clsx` with `tailwind-merge` to handle class merging safely (never concatenate Tailwind classes with template literals).

---

### 3. Animations and Micro-interactions

**Finding:** Framer Motion was rebranded to "Motion" (motion/react package) in 2025. Motion is the industry standard for React micro-interactions.

**Details:**
- **Package name change**: `framer-motion` → `motion` on npm, imports from `motion/react`
- **Latest version**: Motion v12+ supports new color formats (oklch, oklab, lab, lch)
- **Gesture handling**: `whileHover`, `whileTap`, `whileDrag` props for natural interactions
- **Spring physics**: Velocity-aware animations, drag constraints, elastic easing
- **Motion Primitives**: Open-source animated component kit with production-ready patterns (text reveals, magnetic effects, etc.)
- **2025 trends**: Subtle, purposeful animations over flashy ones; minimalism meets motion

**Montana OS Micro-interactions:**
```tsx
// Button hover effect
<motion.button
  whileHover={{ 
    y: -2, 
    boxShadow: "0 6px 12px rgba(251, 191, 36, 0.25)" 
  }}
  whileTap={{ y: 0 }}
  transition={{ duration: 0.2 }}
>
  Botón
</motion.button>

// Card hover lift
<motion.div
  whileHover={{ y: -4 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  <PropertyCard />
</motion.div>

// Loading spinner
<motion.div
  animate={{ rotate: 360 }}
  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
/>
```

**Recommendation:** Install Motion (motion/react). Use for button hovers, card lifts, loading states, page transitions. Keep animations subtle (200-300ms duration). Avoid animation on scroll (bad for performance).

---

### 4. Real Estate CRM Dashboard Patterns

**Finding:** Modern real estate dashboards (2025) focus on visual lead management, real-time updates, customizable layouts, and mobile responsiveness.

**Details:**
- **Core features**: Kanban board (visual lead pipeline), analytics widgets, agent board, activity feed, export options
- **Grid system**: 12-column grid with 24px gutters for responsive layouts
- **Typography**: Inter/Poppins with clear hierarchy (headings 12-20px, body 14px)
- **Real-time expectations**: Live data updates with smooth transitions, "last refreshed" timestamps
- **Customization**: Users should control widget arrangement, filter persistence, light/dark mode toggle
- **Mobile**: Responsive design required; layouts must adapt gracefully (no horizontal scroll)

**Montana OS Dashboard Structure:**
```
Layout:
├── Navbar (sticky, 64px height)
│   ├── Logo
│   ├── Nav items (Properties, Leads, Pipeline, Commissions)
│   └── CTA button
├── Body (flex)
│   ├── Sidebar (256px, hidden on mobile)
│   │   ├── Logo section
│   │   └── Nav items (role-based)
│   └── Main content area
│       ├── TopBar (optional, per-page)
│       └── Content (padding 24px-48px)
```

**Recommendation:** Build dashboard with Next.js App Router. Use 12-column grid for widget layouts. Implement real-time updates with smooth CSS transitions (not instant). Add customization features (drag-to-reorder, save layout) for competitive advantage.

---

### 5. Best Practices Summary (2025-2026)

| Practice | Why | How |
|----------|-----|-----|
| **Component-based, not @apply** | Enables reusability and refactoring | Build React components, style with Tailwind utilities inside them |
| **Design tokens as CSS variables** | Runtime theming, consistency, maintainability | Use Tailwind v4 @theme in CSS file |
| **Mobile-first responsive** | Better accessibility, cleaner code | Start with mobile utilities, enhance with md:, lg: breakpoints |
| **Accessibility by default** | Legal/ethical requirement, better UX | Use shadcn/ui + Radix, test keyboard nav, check WCAG contrast |
| **Semantic HTML** | Screen reader compatibility | Use `<button>`, `<input>`, `<label>` elements correctly |
| **Focus management** | Keyboard navigation essential | Visible focus rings (3:1 contrast), logical tab order |
| **Micro-interactions subtle** | Builds trust, not annoyance | 200-300ms duration, ease-out easing, purposeful animations |
| **Dark mode via CSS variables** | Easy theming, future-proof | Define color tokens in HSL with light/dark values |

---

## Recommended Implementation Stack

```json
{
  "core": {
    "framework": "Next.js 15+ (React 19)",
    "styling": "Tailwind CSS v4",
    "package-manager": "npm"
  },
  "components": {
    "ui-foundation": "shadcn/ui (Radix + Tailwind)",
    "icons": "lucide-react",
    "animations": "motion (formerly Framer Motion)"
  },
  "utilities": {
    "class-merge": "clsx + tailwind-merge (cn utility)",
    "form-validation": "react-hook-form + zod"
  },
  "quality": {
    "accessibility": "WCAG 2.1 AA (built-in via shadcn)",
    "testing": "Vitest + React Testing Library (already in project)",
    "type-safety": "TypeScript (already in project)"
  }
}
```

---

## Critical Implementation Notes

1. **Tailwind v4 migration** (if upgrading from v3):
   - Change `tailwind.config.js` → CSS `@theme` block
   - Update color definitions to OKLCH format
   - Test all utilities work (breaking changes minimal but check docs)

2. **shadcn/ui setup**:
   - Run `npx shadcn-ui@latest init` in project
   - Choose Tailwind preset
   - Copy components one at a time as needed (don't copy all upfront)

3. **Design tokens**:
   - Define in `src/app/globals.css` using CSS variables
   - Never hardcode colors in components
   - Ensure light/dark mode support from day one

4. **Animation gotchas**:
   - Use `will-change: transform` on animated elements (performance)
   - Disable animations on `prefers-reduced-motion` queries
   - Test on low-end devices; expensive animations = bad UX

5. **Accessibility testing**:
   - Use `axe DevTools` browser extension for audits
   - Test keyboard navigation: Tab, Shift+Tab, Enter, Space, Arrow keys
   - Use screen reader (NVDA/JAWS on Windows, VoiceOver on Mac)
   - Verify 4.5:1 contrast ratio for all text

---

## Sources

**Design Systems & Tailwind v4:**
- [Tailwind CSS 4 @theme: The Future of Design Tokens (2025 Guide)](https://medium.com/@sureshdotariya/tailwind-css-4-theme-the-future-of-design-tokens-at-2025-guide-48305a26af06)
- [Design Tokens That Scale in 2026 (Tailwind v4 + CSS Variables)](https://www.maviklabs.com/blog/design-tokens-tailwind-v4-2026/)
- [Tailwind CSS v4.0 Blog](https://tailwindcss.com/blog/tailwindcss-v4)
- [The Essential Guide to Tailwind CSS Best Practices for React Developers (2025)](https://dev.to/sorenvahlreact/the-essential-guide-to-tailwind-css-best-practices-for-react-developers-2025-2hjh)

**Accessible Components:**
- [The Ultimate Guide to Accessible shadcn/ui Components](http://www.blog.brightcoding.dev/2025/12/15/the-ultimate-guide-to-accessible-shadcn-ui-components-build-production-ready-apps-with-react-typescript-tailwind-css)
- [WCAG 2.2 React Components: Complete 2025 Compliance Guide](https://drcodes.com/posts/wcag-22-react-components-complete-2025-compliance-guide)
- [shadcn/ui Official Docs](https://ui.shadcn.com/)

**Animations & Micro-interactions:**
- [Motion for React - Animation Library](https://motion.dev/docs/react)
- [CSS / JS Animation Trends 2026: Motion & Micro-Interactions](https://webpeak.org/blog/css-js-animation-trends/)
- [Micro-Interactions in Web Design: CSS Animations and Framer Motion](https://nexisltd.com/blog/micro-interactions-web-design-css-animations-framer-motion)

**Real Estate CRM Patterns:**
- [Real Estate CRM Dashboard UI Design - Medium Case Study](https://armansomoy.medium.com/ux-ui-case-study-real-real-estate-crm-18ea8cd1cfe1)
- [20 Best Dashboard UI/UX Design Principles for 2025](https://medium.com/@allclonescript/20-best-dashboard-ui-ux-design-principles-you-need-in-2025-30b661f2f795)

**Additional Best Practices:**
- [React & CSS in 2026: Best Styling Approaches Compared](https://medium.com/@imranmsa93/react-css-in-2026-best-styling-approaches-compared-d5e99a771753)
- [Top 7 React Animation Libraries for Enterprise Apps in 2026](https://www.syncfusion.com/blogs/post/top-react-animation-libraries)

---

**Research completed:** 2026-05-20  
**Next step:** Skills audit → Skills creation → Writing plans
