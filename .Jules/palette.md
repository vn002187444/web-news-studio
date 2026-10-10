## 2024-10-10 - Accessibility for Category Dropdown
**Learning:** Missing aria-controls in dropdowns affects screen readers from understanding relationships between the button and menu. Also missing focus visible state styles makes it hard for keyboard navigation to identify where the user is.
**Action:** Next time when building dropdowns and modals, ensure aria-controls connects to the expanded component id, and focus-visible pseudo classes are added.
