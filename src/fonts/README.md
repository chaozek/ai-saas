# Font Setup for eToro-style Typography

This project uses the same typography as eToro:

## Fonts Used:
- **H1 Headings**: Tusker Grotesk (premium font)
- **All Other Text**: Madera (local font)

## Setup Instructions:

### 1. Tusker Grotesk (Headings)
Tusker Grotesk is a premium font that needs to be purchased. You can get it from:
- [Tusker Grotesk Official Site](https://www.tuskerfont.com/)

### 2. Font Files Used
The following font files are currently being used:

**Tusker Grotesk (H1 Headings):**
- `TuskerGrotesk-3500Medium.woff2` (weight: 500)
- `TuskerGrotesk-3600Semibold.woff2` (weight: 600)
- `TuskerGrotesk-3700Bold.woff2` (weight: 700)
- `TuskerGrotesk-3800Super.woff2` (weight: 800)

**Madera (All Other Text):**
- `fonnts.com-Madera_W01_Thin.ttf` (weight: 100)
- `Madera_Regular.ttf` (weight: 400)
- `fonnts.com-Madera_W04_Medium_Italic.ttf` (weight: 500, italic)
- `fonnts.com-Madera_W04_Bold.ttf` (weight: 700)
- `fonnts.com-Madera_W01_Bold.ttf` (weight: 800)

### 3. Alternative Approach
If you don't have access to Tusker Grotesk, you can:
1. Replace it with a similar free alternative like "Outfit" or "Cabinet Grotesk"
2. Update the font configuration in `src/app/layout.tsx`
3. Update the CSS variables in `src/app/globals.css`

### 4. Usage in CSS
```css
/* For H1 headings */
h1 {
  font-family: var(--font-tusker-grotesk);
}

/* For all other text */
body, h2, h3, h4, h5, h6, p, span, div, a, button, input, textarea, label, li, td, th {
  font-family: var(--font-madera);
}
```

### 5. Tailwind Classes
You can also use these Tailwind classes:
```html
<h1 class="font-tusker">H1 with Tusker Grotesk</h1>
<h2 class="font-madera">H2 with Madera</h2>
<p class="font-madera">Body text with Madera</p>
```