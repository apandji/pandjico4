# Homepage Main Section Redesign

## Current State
- Hero: "Hi, I'm Pandji." + tagline
- Featured projects grid (desktop)
- "See all works" CTA

## Goals
- Modern, clean, content-first
- Mobile: Full viewport images, swipeable carousel
- Black background on mobile (OLED-friendly)
- Better hierarchy between "Hi I'm Pandji" and statement
- Pandji ↔ Andrew switching on mobile (currently desktop hover only)
- Underline indicator for clickable name

## Questions to Resolve

### 1. Mobile Carousel
- **Which 5 projects?** (You mentioned: Sail, Driftpad, Ascension RX, Sapling, Weather Aura)
- **Full viewport height?** (100vh per card)
- **Swipe direction?** (Horizontal left/right or vertical up/down?)
- **Navigation indicators?** (Dots, arrows, or just swipe?)
- **Auto-play?** (Probably not, but asking)

### 2. Desktop Layout
- **Keep grid?** Or something else?
- **How many featured?** (All 5 or subset?)
- **Card style?** (Full images, text overlay, or separate text?)

### 3. Content Structure
- **Blurbs on cards?** (On mobile cards, desktop cards, or both?)
- **Blurb length?** (One line, paragraph, or variable?)
- **Project title visible?** (Always, on hover, or in blurb?)

### 4. Hero Section
- **New statement:** "I'm a designer and technologist creating interactive experiences rooted in tactility, grounding, and wellness."
- **Hierarchy:** How much bigger/smaller should each element be?
- **Spacing:** More space between "Hi I'm Pandji" and statement?
- **Mobile:** Same layout or stacked differently?

### 5. Name Switching (Pandji ↔ Andrew)
- **Mobile trigger:** Tap, or auto-switch on interval?
- **Desktop:** Keep hover, or change to click?
- **Animation:** Same glitch effect or different?
- **Underline:** Always visible, or only on hover/focus?

### 6. Visual Design
- **Mobile black background:** Just the carousel area, or entire page?
- **Desktop:** Keep white/current, or also black?
- **Typography:** Same fonts/sizes, or adjust for hierarchy?
- **Spacing:** More breathing room?

## Proposed Structure

### Mobile
```
[Header - black background]
  Hi, I'm [Pandji/Andrew] (underline, clickable)
  [New statement - smaller, more space above]

[Full-viewport Carousel - black background]
  Card 1: [Full image] + [Blurb overlay or below]
  Card 2: [Full image] + [Blurb overlay or below]
  ... (swipeable, 5 cards)

[Footer/CTA?]
```

### Desktop
```
[Header - white/current background]
  Hi, I'm [Pandji/Andrew] (underline, hover/click)
  [New statement - better hierarchy]

[Featured Projects Grid/Carousel]
  [Card 1] [Card 2] [Card 3]
  [Card 4] [Card 5]
```

## Next Steps
1. Answer questions above
2. Update hero statement and hierarchy
3. Add underline to Pandji name
4. Implement mobile name switching
5. Scaffold mobile carousel structure
6. Design card layouts (mobile + desktop)
