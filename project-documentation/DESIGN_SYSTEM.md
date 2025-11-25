# Design System

**Last Updated:** 2025-11-25

---

## Color System

### Primary Palette
```
Ink:  #0e1a2b (HSL: 210 58% 11%)  - Main structure, typography
Mint: #7ef4c2 (HSL: 158 82% 73%) - Highlights, sparingly
```

### Neutrals
```
Off-White:   #F7F7F5 (HSL: 60 9% 96%)  - Background
Light Grey:  #E5E5E3 (HSL: 60 5% 90%)  - Borders
Mid Grey:    #9AA0A6 (HSL: 210 7% 62%) - Secondary text
Graphite:    #333639 (HSL: 200 5% 21%) - Strong text
```

### Semantic Mappings
```css
--background: var(--off-white)
--foreground: var(--ink)
--muted: var(--light-grey)
--muted-foreground: var(--mid-grey)
--primary: var(--ink)
--accent: var(--mint)
--ring: var(--mint)
```

---

## Typography

### Font Families
```
Primary: 'Inter' - Body text, UI
Display: 'Gobold' - Headlines, hero text
```

### Scale
```
Hero:     text-5xl to text-6xl (48-60px)
H1:       text-4xl to text-5xl (36-48px)
H2:       text-3xl to text-4xl (30-36px)
H3:       text-2xl (24px)
Body:     text-base (16px)
Small:    text-sm (14px)
Tiny:     text-xs (12px)
```

### Usage Rules
- **Gobold:** Hero headlines only, sparingly
- **Inter:** All other text
- **Line Height:** 1.6 for body, 1.2 for headlines
- **Letter Spacing:** Tight (-0.02em) for headlines

---

## Spacing System

### Scale (Tailwind)
```
0.5  = 2px   (xs gaps)
1    = 4px   (tight spacing)
2    = 8px   (compact)
3    = 12px  (default gap)
4    = 16px  (comfortable)
6    = 24px  (section spacing)
8    = 32px  (large gaps)
12   = 48px  (section padding)
16   = 64px  (major sections)
20   = 80px  (hero padding)
```

### Utility Classes
```
section-padding:    py-12 md:py-20 (sections)
container-width:    max-w-7xl mx-auto px-4
touch-target:       min-h-[44px] (mobile buttons)
```

---

## Component Patterns

### Buttons

**Primary (Mint)**
```tsx
<Button className="bg-mint text-ink hover:bg-mint/90">
```

**Secondary (Ink)**
```tsx
<Button className="bg-ink text-white hover:bg-ink/90">
```

**Outline**
```tsx
<Button variant="outline" className="border-mint text-mint">
```

### Cards

**Premium Card** (featured content)
```tsx
<div className="premium-card">
  // bg-white, border-2, shadow-lg, p-6
</div>
```

**Minimal Card** (standard content)
```tsx
<div className="minimal-card">
  // bg-card, border, p-6
</div>
```

### Modals/Dialogs
```tsx
<Dialog>
  <DialogContent className="sm:max-w-[520px]">
    // White bg, rounded-lg, shadow
  </DialogContent>
</Dialog>
```

---

## Animation System

### Keyframes
```css
fade-in-up: opacity 0→1, translateY 20px→0 (0.6s)
pulse: scale 1→1.05→1 (2s infinite)
```

### Usage
```tsx
className="fade-in-up" style={{animationDelay: '0.1s'}}
```

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
```

---

## Responsive Breakpoints

```
sm:  640px  (mobile landscape)
md:  768px  (tablet)
lg:  1024px (desktop)
xl:  1280px (large desktop)
2xl: 1536px (extra large)
```

### Mobile-First Approach
Base styles = mobile, use `md:`, `lg:` for larger screens

---

## Layout Patterns

### Hero Section
```tsx
<section className="min-h-screen flex items-center bg-ink text-white">
  <div className="container-width">
    <h1 className="text-5xl md:text-6xl font-bold">
```

### Content Section
```tsx
<section className="section-padding bg-background">
  <div className="container-width">
    <h2 className="text-3xl md:text-4xl font-bold mb-8">
```

### Grid Layouts
```tsx
<div className="grid md:grid-cols-3 gap-6">
  // Mobile: 1 col, Tablet+: 3 cols
</div>
```

---

## Icon System

**Library:** Lucide React  
**Size:** `h-5 w-5` standard, `h-6 w-6` large  
**Color:** Inherit from parent

```tsx
import { ArrowRight, CheckCircle } from "lucide-react"
<CheckCircle className="h-5 w-5 text-mint" />
```

---

## Form Elements

### Input Fields
```tsx
<Input 
  className="border-input bg-background"
  placeholder="Your email"
/>
```

### Labels
```tsx
<Label className="text-sm font-semibold">
```

### Radio Groups
```tsx
<RadioGroup>
  <RadioGroupItem value="option" />
</RadioGroup>
```

---

## Accessibility

### Focus States
```css
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

### ARIA Labels
```tsx
<button aria-label="Close dialog">
```

### Semantic HTML
Use `<main>`, `<section>`, `<nav>`, `<article>` appropriately

---

## Design Tokens Location

**File:** `src/index.css`  
**Config:** `tailwind.config.ts`

All colors, spacing, typography defined as CSS variables and Tailwind extensions.

**Never hardcode colors** - always use tokens:
- ✅ `bg-mint`, `text-ink`, `border-muted`
- ❌ `bg-[#7ef4c2]`, `text-[#0e1a2b]`

---

**End of DESIGN_SYSTEM**

All design tokens are defined in `src/index.css` and `tailwind.config.ts`. Never use direct color values in components - always reference semantic tokens.

### Color Palette (HSL Format)

**Primary Colors:**
```css
--background: 0 0% 100%           /* White background */
--foreground: 222.2 84% 4.9%      /* Near-black text */
--card: 0 0% 100%                 /* Card background */
--card-foreground: 222.2 84% 4.9% /* Card text */
--popover: 0 0% 100%              /* Popover background */
--popover-foreground: 222.2 84% 4.9% /* Popover text */
```

**Brand Colors:**
```css
--primary: 221.2 83.2% 53.3%      /* Blue primary */
--primary-foreground: 210 40% 98% /* Light text on primary */
--secondary: 210 40% 96.1%        /* Light secondary */
--secondary-foreground: 222.2 47.4% 11.2% /* Dark text on secondary */
```

**Semantic Colors:**
```css
--muted: 210 40% 96.1%            /* Muted background */
--muted-foreground: 215.4 16.3% 46.9% /* Muted text */
--accent: 210 40% 96.1%           /* Accent background */
--accent-foreground: 222.2 47.4% 11.2% /* Accent text */
--destructive: 0 84.2% 60.2%      /* Error/destructive red */
--destructive-foreground: 210 40% 98% /* Text on destructive */
```

**Borders & UI:**
```css
--border: 214.3 31.8% 91.4%       /* Default border */
--input: 214.3 31.8% 91.4%        /* Input border */
--ring: 221.2 83.2% 53.3%         /* Focus ring (matches primary) */
```

**Chart Colors (for data visualization):**
```css
--chart-1: 12 76% 61%             /* Orange */
--chart-2: 173 58% 39%            /* Teal */
--chart-3: 197 37% 24%            /* Dark blue-green */
--chart-4: 43 74% 66%             /* Yellow */
--chart-5: 27 87% 67%             /* Coral */
```

### Dark Mode Colors

When dark mode is active (`.dark` class on root element):

```css
--background: 222.2 84% 4.9%
--foreground: 210 40% 98%
--card: 222.2 84% 4.9%
--card-foreground: 210 40% 98%
/* ... (see index.css for full dark mode palette) */
```

## Typography

### Font Families

**Primary (Sans-serif):**
- Font: Inter
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Usage: Body text, UI elements, most content

**Headings:**
- Same as primary (Inter)
- Weights: 600 (semibold), 700 (bold)

### Type Scale

```css
/* Font sizes defined in tailwind.config.ts */
xs: 0.75rem    /* 12px */
sm: 0.875rem   /* 14px */
base: 1rem     /* 16px */
lg: 1.125rem   /* 18px */
xl: 1.25rem    /* 20px */
2xl: 1.5rem    /* 24px */
3xl: 1.875rem  /* 30px */
4xl: 2.25rem   /* 36px */
```

**Usage guidelines:**
- Body text: `text-base` (16px)
- Small text: `text-sm` (14px)
- Tiny text: `text-xs` (12px)
- Section headings: `text-xl` or `text-2xl`
- Page titles: `text-3xl` or `text-4xl`

### Line Heights

```
tight: 1.25
normal: 1.5
relaxed: 1.75
```

## Spacing System

Based on 4px base unit:

```
0: 0px
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
20: 5rem (80px)
24: 6rem (96px)
```

**Usage patterns:**
- Between components: `gap-4` or `gap-6`
- Card padding: `p-6` or `p-8`
- Section margins: `mb-8` or `mb-12`
- Tight spacing: `gap-2` or `space-y-2`

## Border Radius

```
none: 0
sm: 0.125rem (2px)
DEFAULT: 0.375rem (6px)  /* Most common */
md: 0.375rem (6px)
lg: 0.5rem (8px)
xl: 0.75rem (12px)
2xl: 1rem (16px)
full: 9999px (circles)
```

**Usage:**
- Buttons: `rounded-md` (6px)
- Cards: `rounded-lg` (8px)
- Large panels: `rounded-xl` (12px)
- Avatars: `rounded-full`

## Shadows

```css
sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
DEFAULT: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
```

**Usage:**
- Cards: `shadow-md`
- Elevated panels: `shadow-lg`
- Subtle depth: `shadow-sm`

## Component Patterns

### Buttons

```tsx
// Primary button
<Button variant="default">Primary Action</Button>

// Secondary button
<Button variant="outline">Secondary Action</Button>

// Destructive button
<Button variant="destructive">Delete</Button>

// Ghost button (minimal)
<Button variant="ghost">Cancel</Button>

// Link-styled button
<Button variant="link">Learn More</Button>
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

### Forms

```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="field">Field Label</Label>
    <Input id="field" placeholder="Enter value" />
  </div>
</div>
```

### Alert/Toast Messages

```tsx
// Success toast
toast.success("Action completed successfully")

// Error toast
toast.error("Something went wrong")

// Info toast
toast.info("New data available")
```

## Responsive Breakpoints

```
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

**Usage pattern:**
```tsx
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## Animation/Transitions

**Default transition:**
```css
transition: all 0.2s ease-in-out
```

**Usage:**
```tsx
// Hover effects
<button className="transition-colors hover:bg-primary/90">

// Fade in
<div className="animate-fade-in">

// Scale on hover
<div className="transition-transform hover:scale-105">
```

## Accessibility

**Focus states:**
- All interactive elements must have visible focus ring
- Use `ring-ring` for focus outlines
- Never remove focus styles globally

**Color contrast:**
- Text on background: minimum 4.5:1 ratio
- Large text (18pt+): minimum 3:1 ratio
- Use foreground tokens, never direct colors

**Touch targets:**
- Minimum 44x44px for mobile buttons
- Use `p-4` or larger on touch elements
