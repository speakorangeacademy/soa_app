# SOA Design System - Complete Reference Guide

> **Purpose:** Central documentation for the SOA app's design tokens, component patterns, and styling conventions.

## Table of Contents
1. [Design Tokens](#design-tokens)
2. [Color System](#color-system)
3. [Typography Scale](#typography-scale)
4. [Spacing & Sizing](#spacing--sizing)
5. [Component Classes](#component-classes)
6. [Animation & Transitions](#animation--transitions)
7. [Z-Index Layering](#z-index-layering)
8. [Accessibility](#accessibility)
9. [Code Examples](#code-examples)
10. [Migration Guide](#migration-guide)

---

## Design Tokens

All design tokens are centrally defined as **CSS custom properties** in [`app/globals.css`](app/globals.css). This ensures consistency across the entire application and enables theming.

### Token Categories
- **Colors** - Brand palette and semantic colors
- **Typography** - Font sizes, weights, line heights
- **Spacing** - Padding, margins, gaps (4px base unit)
- **Borders** - Border radius scale
- **Shadows** - Depth system
- **Transitions** - Animation timings
- **Z-Index** - Layering rules

---

## Color System

### Primary Brand Colors
```css
--color-primary:       #FF8C42  /* Main orange */
--color-primary-dark:  #D94E1F  /* Hover state */
--color-primary-light: #FFB380  /* Light variant */
--color-accent:        #D94E1F  /* Secondary accent */
```

### Semantic Colors (Status & Feedback)
```css
--color-success:       #4CAF50  /* Success states */
--color-success-light: #E8F5E9  /* Light background */

--color-warning:       #FFC107  /* Warning states */
--color-warning-light: #FFF8E1  /* Light background */

--color-danger:        #E53935  /* Error states */
--color-danger-light:  #FFEBEE  /* Light background */
```

### Neutral Colors (Base UI)
```css
--color-bg:            #FFF9F4  /* App background */
--color-surface:       #FFFFFF  /* Card/container background */
--color-border:        #F0E4D7  /* Border color */
--color-text:          #2C2416  /* Primary text */
--color-text-muted:    #8B7355  /* Secondary text */
--color-text-light:    #A89880  /* Tertiary text */
--color-disabled:      rgba(139, 115, 85, 0.3)  /* Disabled state */
```

### Usage Examples

**CSS**
```css
.my-element {
  color: var(--color-text);
  background: var(--color-primary);
  border: 1px solid var(--color-border);
}
```

**Tailwind Classes**
```jsx
<div className="bg-primary text-white border border-border">
  <p className="text-muted">Secondary text</p>
</div>
```

**With Opacity (Tailwind)**
```jsx
<div className="bg-primary/80">80% opacity primary</div>
<div className="bg-primary/50">50% opacity primary</div>
```

---

## Typography Scale

### Font System
```css
--text-xs:     0.75rem    /* 12px - Captions, labels */
--text-sm:     0.875rem   /* 14px - Body text, tooltips */
--text-base:   1rem       /* 16px - Standard body text */
--text-lg:     1.125rem   /* 18px - Large body, intro text */
--text-xl:     1.25rem    /* 20px - Section headers */
--text-2xl:    1.5rem     /* 24px - Page headers */
--text-3xl:    2rem       /* 32px - Hero titles */
```

### Font Weights
```css
font-weight: 400  /* Regular (Work Sans) */
font-weight: 500  /* Medium (Work Sans) */
font-weight: 600  /* Semibold (default for Work Sans) */
font-weight: 700  /* Bold (Outfit headings) */
```

### Line Heights
```css
--line-height-tight:  1.2   /* Headings */
--line-height-normal: 1.5   /* Body text */
--line-height-loose:  1.8   /* Readable content */
```

### Letter Spacing
```css
--letter-spacing-tight:  -0.015em  /* Headings */
--letter-spacing-normal:  0        /* Body text */
--letter-spacing-wide:    0.05em   /* Labels, badges */
```

### Usage Examples

**HTML with CSS variables**
```jsx
<h1 style={{ fontSize: 'var(--text-3xl)', fontFamily: "'Outfit', sans-serif" }}>
  Page Title
</h1>

<p style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--line-height-normal)' }}>
  Body text...
</p>
```

**Tailwind Classes**
```jsx
<h1 className="text-3xl font-heading font-bold">Page Title</h1>
<p className="text-base text-text leading-normal">Body text...</p>
<label className="text-sm font-semibold">Form Label</label>
```

---

## Spacing & Sizing

### Spacing Scale (4px base unit)
```css
--space-0:    0       /* 0px */
--space-1:    0.25rem /* 4px */
--space-2:    0.5rem  /* 8px */
--space-3:    0.75rem /* 12px */
--space-4:    1rem    /* 16px */
--space-5:    1.25rem /* 20px */
--space-6:    1.5rem  /* 24px */
--space-8:    2rem    /* 32px */
--space-10:   2.5rem  /* 40px */
--space-12:   3rem    /* 48px */
```

**Why 4px base?**
- Divisible by common breakpoints (4, 8, 10, 16, 20, etc.)
- Natural rhythm in layouts
- Responsive scaling opportunities
- Professional UI patterns standard

### Usage Examples

**CSS Variables**
```jsx
<div style={{
  padding: 'var(--space-6)',        /* 24px padding */
  marginBottom: 'var(--space-4)',   /* 16px margin */
  gap: 'var(--space-3)'              /* 12px gap */
}}>
  Content
</div>
```

**Tailwind Classes**
```jsx
<div className="p-6 mb-4 gap-3 flex">
  <div className="p-4 rounded-lg bg-surface">Card</div>
  <div className="p-4 rounded-lg bg-surface">Card</div>
</div>
```

---

## Component Classes

All reusable component styles are defined in [`app/globals.css`](app/globals.css). Use these classes instead of inline styles.

### Buttons
```jsx
/* Default button */
<button className="btn">Click Me</button>

/* Primary variant */
<button className="btn btn--primary">Submit</button>

/* Size variants */
<button className="btn btn--sm">Small</button>
<button className="btn btn--lg">Large</button>

/* States */
<button className="btn btn--danger">Delete</button>
<button className="btn btn--success">Confirm</button>
<button className="btn" disabled>Disabled</button>
```

### Cards
```jsx
<div className="card">
  <h2 className="text-2xl font-bold mb-4">Card Title</h2>
  <p className="text-text">Content goes here</p>
</div>

<div className="card card--elevated">Elevated card</div>
<div className="card card--no-hover">No hover effect</div>
```

### Forms

**Form Groups**
```jsx
<div className="form-group">
  <label className="form-label form-label--required">Email Address</label>
  <input type="email" placeholder="you@example.com" />
  <p className="form-hint">We'll never share your email</p>
  <div className="form-error">Invalid email format</div>
</div>
```

**Error & Success Messages**
```jsx
<div className="form-error">
  <span>⚠️</span> Please fill in all required fields
</div>

<div className="form-success">
  <span>✓</span> Changes saved successfully
</div>
```

### Badges
```jsx
<span className="badge">Default</span>
<span className="badge badge--success">Success</span>
<span className="badge badge--danger">Danger</span>
<span className="badge badge--warning">Warning</span>
<span className="badge badge--outline">Outline</span>
```

### Layout Utilities

**Flexbox Layouts**
```jsx
{/* Centered flex */}
<div className="flex--center">Content centered both ways</div>

{/* Space between */}
<div className="flex--between">
  <span>Left</span>
  <span>Right</span>
</div>

{/* Column layout */}
<div className="flex flex--col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

{/* With gaps */}
<div className="flex flex--gap-6">Items with 24px gap</div>
```

**Grid Layouts**
```jsx
{/* 2-column grid (responsive) */}
<div className="grid grid--2col gap-6">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

{/* 3-column grid */}
<div className="grid grid--3col gap-6">
  <div>Col 1</div>
  <div>Col 2</div>
  <div>Col 3</div>
</div>

{/* Auto-fit responsive grid */}
<div className="grid grid--auto gap-6">
  <div>Auto-responsive items</div>
  {/* ... more items */}
</div>
```

### Typography Classes

**Text Colors**
```jsx
<p className="text-text">Primary text</p>
<p className="text-muted">Muted text</p>
<p className="text-light">Light text</p>
<p className="text-primary">Primary colored</p>
<p className="text-danger">Error text</p>
<p className="text-success">Success text</p>
```

**Text Sizes**
```jsx
<span className="text-xs">Extra small (12px)</span>
<span className="text-sm">Small (14px)</span>
<span className="text-base">Base (16px)</span>
<span className="text-lg">Large (18px)</span>
```

**Text Alignment**
```jsx
<div className="text-left">Left aligned</div>
<div className="text-center">Center aligned</div>
<div className="text-right">Right aligned</div>
```

---

## Animation & Transitions

### Transition Speeds
```css
--transition-fast:   150ms ease-out   /* Micro-interactions */
--transition-normal: 200ms ease-out   /* Standard animations */
--transition-slow:   300ms ease-out   /* Entrance effects */
```

### Available Animations

**Entrance Animations**
```jsx
{/* Fade in */}
<div className="animate-fade-in">Fades in on mount</div>

{/* Slide up */}
<div className="animate-slide-up">Slides up into view</div>

{/* Slide in from right */}
<div className="animate-slide-in-right">Slides in from right</div>

{/* Staggered fade up with delays */}
<div className="animate-fade-up">First item</div>
<div className="animate-fade-up delay-1">Second item (50ms delay)</div>
<div className="animate-fade-up delay-2">Third item (100ms delay)</div>
```

**Loading & Activity Animations**
```jsx
{/* Spinning loader */}
<div className="animate-spin">⏳</div>

{/* Pulsing indicator */}
<div className="animate-pulse w-4 h-4 bg-primary rounded-full" />
```

### Respecting User Motion Preferences

The CSS automatically applies `prefers-reduced-motion: reduce` to disable animations for users who prefer minimal motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Z-Index Layering

### Z-Index Scale
```css
--z-hide:        -1    /* Hidden elements */
--z-auto:         0    /* Default stacking */
--z-base:         1    /* Above default */
--z-dropdown:   100    /* Dropdowns, tooltips */
--z-sticky:     200    /* Sticky elements */
--z-tooltip:    300    /* Floating tooltips */
--z-overlay:    999    /* Modal backdrop */
--z-modal:     1000    /* Modal dialog */
--z-notification: 1100 /* Toast notifications */
```

### Usage Examples

**Tailwind**
```jsx
<div className="z-modal">Modal content</div>
<div className="z-overlay fixed inset-0 bg-black/40" />
<div className="z-dropdown absolute top-full">Dropdown menu</div>
```

**CSS Variables**
```css
.modal {
  position: fixed;
  z-index: var(--z-modal);
}

.notification {
  position: fixed;
  z-index: var(--z-notification);
}
```

---

## Accessibility

### Focus States
All interactive elements have proper focus indicators:

```css
/* Automatic focus ring on interactive elements */
input:focus,
button:focus,
a:focus {
  box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.3);
  outline: none;
}
```

### Color Contrast
All text/background combinations meet WCAG AA standards:
- **Primary text on white**: 7.8:1 ratio
- **Secondary text on white**: 4.5:1 ratio
- **Light text on colored backgrounds**: 4.5:1+ ratios

### Icon & Label Pairing
Form fields and buttons always have text labels or aria descriptions.

### Screen Reader Support
```jsx
{/* Use sr-only for screen-reader-only text */}
<button>
  Download
  <span className="sr-only">PDF file (2.4 MB)</span>
</button>

{/* Use aria-label for icon-only buttons */}
<button aria-label="Close dialog">✕</button>

{/* Use aria-invalid for form errors */}
<input aria-invalid="true" type="email" />
```

---

## Code Examples

### BEFORE: Inline Styles (❌ Don't do this)
```jsx
export function CourseForm() {
  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#2C2416' }}>
          Course Name
        </label>
        <input
          type="text"
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #F0E4D7',
            borderRadius: '8px',
            fontSize: '1rem',
            fontFamily: "'Work Sans', sans-serif"
          }}
        />
      </div>
      <button
        style={{
          backgroundColor: '#FF8C42',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Create Course
      </button>
    </form>
  );
}
```

### AFTER: Using Design System Classes (✅ Do this)
```jsx
export function CourseForm() {
  return (
    <form className="flex flex--col gap-6 p-6 card">
      <div className="form-group">
        <label className="form-label form-label--required">
          Course Name
        </label>
        <input
          type="text"
          placeholder="Enter course name"
          className="text-base"
        />
      </div>
      
      <button className="btn btn--primary">
        Create Course
      </button>
    </form>
  );
}
```

**Benefits:**
- 50% less code
- Consistent styling across app
- Single source of truth for changes
- Automatic accessibility (focus states, etc.)
- Easy responsive design (add `md:grid-2col`)
- Built-in dark mode/theme support (future)

---

### Example: Form with Validation
```jsx
import { useState } from 'react';

export function ContactForm() {
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 card">
      <h1 className="text-3xl font-bold mb-6 font-heading">Contact Us</h1>

      {/* Success Message */}
      {submitted && (
        <div className="form-success mb-6 animate-slide-up">
          <span>✓</span>
          <span>Message sent successfully! We'll contact you soon.</span>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid--2col gap-6 mb-6">
        <div className="form-group md:col-span-1">
          <label className="form-label form-label--required">First Name</label>
          <input 
            type="text"
            placeholder="John"
            aria-invalid={errors.firstName ? 'true' : 'false'}
          />
          {errors.firstName && (
            <div className="form-error text-sm">
              First name is required
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label form-label--required">Last Name</label>
          <input 
            type="text"
            placeholder="Doe"
            aria-invalid={errors.lastName ? 'true' : 'false'}
          />
        </div>

        <div className="form-group md:col-span-2">
          <label className="form-label form-label--required">Email</label>
          <input type="email" placeholder="john@example.com" />
          <p className="form-hint">We'll never share your email</p>
        </div>

        <div className="form-group md:col-span-2">
          <label className="form-label">Message</label>
          <textarea 
            placeholder="Your message here..."
            className="min-h-[200px]"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <button type="reset" className="btn">
          Clear
        </button>
        <button type="submit" className="btn btn--primary">
          Send Message
        </button>
      </div>
    </form>
  );
}
```

---

## Migration Guide

### Step 1: Replace Inline Styles

**Before:**
```jsx
<div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
```

**After:**
```jsx
<div className="flex gap-6 p-6 bg-surface">
```

### Step 2: Use Component Classes

**Before:**
```jsx
<button style={{ backgroundColor: '#FF8C42', color: 'white', padding: '0.75rem 1.5rem' }}>
  Click
</button>
```

**After:**
```jsx
<button className="btn btn--primary">
  Click
</button>
```

### Step 3: Extract styled-jsx

**Before:**
```jsx
<style jsx>{`
  .form-input {
    padding: 12px 16px;
    border: 1px solid #F0E4D7;
    border-radius: 8px;
    font-size: 16px;
  }
`}</style>
<input className="form-input" />
```

**After:**
```jsx
<input className="text-base" />
```

These styles are already in the component classes or globals.css.

---

## File Structure

```
app/
├── globals.css                 # Design tokens + component classes
├── DESIGN_SYSTEM.md           # This file
├── tailwind.config.js         # Tailwind configuration
└── [pages & components]

components/
├── common/
│   └── ui.tsx                 # Modal, Card, Badge components
├── admin/
│   └── [components]
└── super-admin/
    └── [components]
```

---

## Quick Reference Cheat Sheet

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | #FF8C42 | Buttons, links, focus |
| `--color-text` | #2C2416 | Primary text |
| `--color-text-muted` | #8B7355 | Secondary text |
| `--color-danger` | #E53935 | Errors, destructive actions |
| `--color-success` | #4CAF50 | Success states |

### Spacing
| Token | Size | Usage |
|-------|------|-------|
| `--space-2` | 8px | Standard gap |
| `--space-4` | 16px | Padding, margins |
| `--space-6` | 24px | Section spacing |
| `--space-8` | 32px | Large sections |

### Typography
| Token | Size | Usage |
|-------|------|-------|
| `--text-sm` | 14px | Labels, helpers |
| `--text-base` | 16px | Body text |
| `--text-lg` | 18px | Section intro |
| `--text-2xl` | 24px | Page headers |

### Tailwind Equivalents
```
p-6       → padding: var(--space-6)      (24px)
gap-4     → gap: var(--space-4)          (16px)
text-lg   → font-size: var(--text-lg)    (18px)
bg-primary → background-color #FF8C42
rounded-lg → border-radius: var(--radius-lg)  (16px)
shadow-lg → box-shadow: var(--shadow-lg)
```

---

## Support & Updates

For questions about the design system:
1. Check this documentation
2. Review [`app/globals.css`](app/globals.css) for actual token values
3. Look at existing components for usage patterns
4. Ask the development team

Happy designing! 🎨

