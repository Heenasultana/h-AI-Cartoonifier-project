#  AI Image Cartoonifier

A simple web app that turns any photo into cartoon art, right in your browser.
No installations. No server. Just open `index.html` and go!

---

##  How to Run

1. Download or clone this repository
2. Open `index.html` in any browser (Chrome, Firefox, Edge)
3. Upload a photo → pick a style → click **Cartoonify!**

That's it. No Python, no Node.js, no setup needed.

---

##  File Structure

```
cartoonifier-project/
│
├── index.html   → The webpage layout (buttons, canvases, dropdowns)
├── style.css    → All the colors and visual styling
├── script.js    → All the JavaScript logic (cartoon effects)
└── README.md    → This file
```

---

##  5 Cartoon Styles

| Style   | Effect                        | How it works                          |
|---------|-------------------------------|---------------------------------------|
| Classic | Bold flat color blocks        | Rounds colors to nearest 40           |
| Soft    | Warm watercolor look          | Larger quantization + warm tint       |
| Sketch  | Black and white pencil        | Converts to grey using weighted avg   |
| Vivid   | High contrast pop art         | Contrast formula: factor × (v-128)+128|
| Anime   | Very flat cel-shading colors  | Rounds colors to nearest 64           |

---

##  Core Concept 

Every image is made of pixels.
Each pixel = 4 numbers: **Red, Green, Blue, Alpha** (each 0–255).

We use the browser's **Canvas API** to:
1. Read those pixel numbers into an array
2. Apply math to change the numbers (= change the look)
3. Write the changed numbers back onto a canvas

```js
// Example: make image black and white
for (let i = 0; i < pixels.length; i += 4) {
  const grey = pixels[i]*0.3 + pixels[i+1]*0.59 + pixels[i+2]*0.11;
  pixels[i]   = grey;  // Red
  pixels[i+1] = grey;  // Green
  pixels[i+2] = grey;  // Blue
}
```

---

## Technologies Used

- **HTML5** — page structure
- **CSS3** — styling and layout
- **JavaScript (Vanilla)** — all logic, no frameworks
- **Canvas API** — image reading and pixel manipulation
- **FileReader API** — reads image from user's device

---

## Features

- Drag and click to upload any image
- 5 different cartoon styles
- Side-by-side before/after comparison
- One-click PNG download
- Works 100% offline — no internet needed after loading

---

*Made using pure HTML, CSS, and JavaScript*
