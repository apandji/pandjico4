// REFERENCE: Previous carousel implementation with card stacking
// Saved for reference - complex approach with absolute positioning and transforms

// This was the previous implementation that had scrolling issues
// Keeping for reference to understand the design intent

/*
Key features from previous implementation:
- Cards stack on top of each other with elevation/shadow
- White top borders on cards (except first)
- Cards slide up from below and overlap
- Weighty, natural animations
- Fixed header and CTA at bottom
- Card height = viewport - header - CTA
*/

// The previous code attempted to:
// 1. Position cards absolutely at calculated positions
// 2. Transform cards to overlap visually while maintaining scroll space
// 3. Handle border-box sizing to account for borders
// 4. Complex height calculations to prevent black space

// Issues encountered:
// - Height mismatches causing black space
// - Border adding to card height inconsistently
// - Scroll snapping not working smoothly
// - Container height calculations being off by pixels
