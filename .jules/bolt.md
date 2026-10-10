## 2024-10-10 - Framer Motion `useMotionValue` for High-Frequency Events
**Learning:** Using React state (e.g., `useState`) to track mouse coordinates (`x`, `y`) inside an `onMouseMove` handler triggers a full component re-render on every pixel of movement (~60 renders per second).
**Action:** When tracking high-frequency events for animation purposes in React, use `framer-motion`'s `useMotionValue` (and optionally `useSpring`) to update the DOM directly, completely bypassing the React component's render cycle.
