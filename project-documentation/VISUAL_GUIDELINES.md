# Visual Guidelines

## Layout Principles

### Grid System

**Desktop (Facilitator View):**
- 12-column grid for main content areas
- 16-24px gutter between columns
- Max content width: 1400px
- Centered layout with side margins

**Mobile (Participant View):**
- Single column, full-width
- 16px side padding
- Cards and forms stack vertically
- Touch targets minimum 44x44px

### Spacing Rhythm

**Between sections:**
- Large sections: 48-64px (mb-12 to mb-16)
- Medium sections: 32-48px (mb-8 to mb-12)
- Small sections: 16-24px (mb-4 to mb-6)

**Within components:**
- Card padding: 24px (p-6)
- Form field spacing: 16px (space-y-4)
- List item spacing: 8-12px (gap-2 to gap-3)

**Consistency rule:**
- Use multiples of 4px for all spacing
- Never use arbitrary values (no `m-[17px]`)

## Color Usage

### Background Hierarchy

```
Page background: bg-background (white in light mode)
Card/panel: bg-card (white with subtle shadow)
Muted sections: bg-muted (very light gray)
Accent highlights: bg-accent (light blue-gray)
```

### Text Hierarchy

```
Primary text: text-foreground (near-black)
Secondary text: text-muted-foreground (medium gray)
Link text: text-primary (blue)
Error text: text-destructive (red)
```

### Interactive Elements

```
Primary buttons: bg-primary text-primary-foreground (blue button, white text)
Secondary buttons: border-input text-foreground (outlined)
Destructive: bg-destructive text-destructive-foreground (red)
Disabled: opacity-50 cursor-not-allowed
```

### Data Visualization

Use chart colors in sequence:
1. Orange (`chart-1`) - primary metric
2. Teal (`chart-2`) - secondary metric
3. Dark blue-green (`chart-3`) - tertiary
4. Yellow (`chart-4`) - highlights
5. Coral (`chart-5`) - warnings

## Typography Hierarchy

### Page Structure

```tsx
// Page title
<h1 className="text-3xl font-bold">Workshop Dashboard</h1>

// Section heading
<h2 className="text-2xl font-semibold mb-6">Segment 2: Bottleneck Board</h2>

// Subsection heading
<h3 className="text-xl font-semibold mb-4">Submitted Bottlenecks</h3>

// Card title
<h4 className="text-lg font-medium">Cluster: Manual Processes</h4>

// Body text
<p className="text-base text-muted-foreground">Description text...</p>

// Small text
<span className="text-sm text-muted-foreground">Last updated 2 minutes ago</span>

// Tiny text
<span className="text-xs text-muted-foreground">ID: 12345</span>
```

### Font Weight Usage

- **Bold (700):** Page titles only
- **Semibold (600):** Section headings
- **Medium (500):** Card titles, button labels
- **Regular (400):** Body text, descriptions

### Line Height

- Headlines: `leading-tight` (1.25)
- Body text: `leading-normal` (1.5)
- Dense data: `leading-snug` (1.375)

## Component Layouts

### Dashboard Cards

```tsx
<Card>
  <CardHeader className="pb-3">
    <CardTitle className="text-xl">Title</CardTitle>
    <CardDescription>Brief description</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Main content */}
  </CardContent>
  <CardFooter className="pt-6 border-t">
    {/* Actions */}
  </CardFooter>
</Card>
```

**Visual properties:**
- Border: 1px solid `border`
- Border radius: 8px (`rounded-lg`)
- Shadow: `shadow-md`
- Padding: 24px (`p-6`)

### Form Layouts

```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label>Field Label</Label>
    <Input placeholder="Placeholder text" />
    <p className="text-sm text-muted-foreground">Helper text</p>
  </div>
  
  <div className="flex gap-3 justify-end">
    <Button variant="outline">Cancel</Button>
    <Button>Submit</Button>
  </div>
</form>
```

**Visual properties:**
- Label above input (never beside)
- Helper text below input
- Buttons right-aligned
- Primary action on right

### List Displays

```tsx
<div className="space-y-3">
  {items.map(item => (
    <div key={item.id} className="p-4 border rounded-lg hover:bg-accent">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="font-medium">{item.title}</h4>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
        <Button variant="ghost" size="sm">Action</Button>
      </div>
    </div>
  ))}
</div>
```

### Empty States

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Icon className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold mb-2">No data yet</h3>
  <p className="text-sm text-muted-foreground max-w-sm">
    Clear explanation of why empty and what to do next
  </p>
  <Button className="mt-6">Primary Action</Button>
</div>
```

## Mobile-Specific Patterns

### Scan QR → Submit Flow

```tsx
// Full-screen mobile layout
<div className="min-h-screen bg-background p-4">
  <div className="max-w-md mx-auto space-y-6">
    {/* Logo/branding */}
    <div className="text-center">
      <img src="/logo.png" className="h-12 mx-auto" />
    </div>
    
    {/* Context card */}
    <Card>
      <CardHeader>
        <CardTitle>Workshop Context</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Company Name</p>
        <p className="text-sm text-muted-foreground">Segment 2</p>
      </CardContent>
    </Card>
    
    {/* Submission form */}
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Bottleneck</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea rows={4} />
      </CardContent>
      <CardFooter>
        <Button className="w-full">Submit</Button>
      </CardFooter>
    </Card>
  </div>
</div>
```

**Mobile guidelines:**
- Full-width buttons (never small)
- Large touch targets (min 44x44px)
- Single-column layout (no side-by-side)
- Generous padding (16-24px)
- Sticky header if needed

## Data Visualization

### Tables

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead className="text-right">Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">Value 1</TableCell>
      <TableCell className="text-right">Value 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Guidelines:**
- Zebra striping for long tables (`odd:bg-muted/50`)
- Right-align numbers
- Left-align text
- Bold first column if it's a label
- Sticky header for long scrolls

### Charts

Use Recharts with chart colors:

```tsx
<BarChart data={data}>
  <Bar dataKey="value" fill="hsl(var(--chart-1))" />
  <Bar dataKey="value2" fill="hsl(var(--chart-2))" />
</BarChart>
```

**Guidelines:**
- Simple, not decorative
- Clear axis labels
- Tooltips on hover
- Responsive width (w-full)
- Minimum height 300px for readability

### Progress Indicators

```tsx
// Loading spinner
<Loader2 className="h-6 w-6 animate-spin text-primary" />

// Progress bar
<Progress value={60} className="w-full" />

// Skeleton loading
<Skeleton className="h-4 w-full" />
```

## Responsive Behavior

### Breakpoint Strategy

**Mobile-first approach:**
```tsx
// Base (mobile): single column
className="grid grid-cols-1"

// Tablet and up: 2 columns
className="grid grid-cols-1 md:grid-cols-2"

// Desktop: 3 columns
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### Hide/Show Elements

```tsx
// Hide on mobile, show on desktop
className="hidden lg:block"

// Show on mobile, hide on desktop
className="lg:hidden"

// Adjust size
className="text-2xl lg:text-4xl"
```

### Navigation

**Desktop:** Horizontal nav, full text labels
**Mobile:** Hamburger menu or bottom nav, icons with minimal text

## Accessibility

### Focus States

All interactive elements must have visible focus:
```tsx
className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
```

### Color Contrast

- Test all text/background combinations
- Minimum 4.5:1 for body text
- Minimum 3:1 for large text (18pt+)
- Use foreground tokens, not direct colors

### Screen Readers

```tsx
// Hidden label for screen readers
<label className="sr-only">Field Name</label>

// Aria labels
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

// Semantic HTML
<nav aria-label="Main navigation">
```

## Animation

### Transitions

**Hover effects:**
```tsx
className="transition-colors hover:bg-accent"
className="transition-transform hover:scale-105"
```

**Loading states:**
```tsx
className="animate-spin"      // Spinner
className="animate-pulse"     // Skeleton loading
className="animate-fade-in"   // Fade in
```

**Duration:**
- Quick interactions: 150-200ms
- Loading states: 300-500ms
- Page transitions: 200-300ms

### Motion Principles

- Smooth, not jarring
- Purpose-driven (not decorative)
- Respect `prefers-reduced-motion`
- Disable on slow connections

## Icons

### Size Guidelines

```tsx
// Inline with text
<Icon className="h-4 w-4" />

// Buttons
<Icon className="h-5 w-5" />

// Large UI elements
<Icon className="h-6 w-6" />

// Empty states
<Icon className="h-12 w-12" />
```

### Color Usage

```tsx
// Match text color
<Icon className="text-muted-foreground" />

// Primary action
<Icon className="text-primary" />

// Error state
<Icon className="text-destructive" />
```

### Common Icons

- CheckCircle: Success, completion
- XCircle: Error, failure
- AlertCircle: Warning, attention needed
- Info: Informational
- ChevronRight: Navigation, expand
- Plus: Add, create
- Trash: Delete, remove
- Edit: Modify, update
- Download: Export, save
