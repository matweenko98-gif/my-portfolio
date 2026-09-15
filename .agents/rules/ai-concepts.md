# AI Concepts Standard Format & Rules

Whenever adding or updating AI Concepts (`🤖 ИИ-Концепт`) in this portfolio project:

1. **Viewer & Display Rules**:
   - Use `ConceptToolbarModal.jsx` with `createPortal(..., document.body)`.
   - Desktop concepts MUST NOT undergo mobile responsive reflow or text wrapping.
   - Fixed desktop canvas width MUST be enforced (`1440px`).
   - On screens < 1440px (smartphones, tablets, small browser windows), the entire 1440px desktop version MUST be proportionally scaled down using `transform: scale(windowWidth / 1440)` with `transform-origin: top left`.
   - The user must see the 100% untouched, exact desktop layout scaled down seamlessly on all devices.

2. **Navigation & Scroll Restoration**:
   - Save exact page scroll position before locking background scroll.
   - Upon closing the viewer (via "Назад" button or `Esc`), restore exact scroll position to the concept card using a delayed `window.scrollTo` (preventing jumps to the top hero section).

3. **Admin Panel Integration**:
   - All AI Concepts are managed under the dedicated `🤖 ИИ-Концепты` tab in Admin Panel (`/admin-keis`).
   - Data attributes: `is_ai_concept: true`, `is_desktop_only: true`, `demo_url: '/demos/<folder>/index.html'`.
