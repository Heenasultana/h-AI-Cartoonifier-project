/*
  FILE: script.js
  WHAT IT DOES: All the logic of the app.
  This file handles:
    1. Loading the image the user picks
    2. Reading pixel data from the image
    3. Applying cartoon effects by changing pixel values
    4. Drawing the result on screen
    5. Downloading the cartoon image
*/


/* ============================================================
   GLOBAL VARIABLE
   A variable accessible by all functions in this file.
   Stores the image the user uploaded.
   ============================================================ */
let loadedImage = null;


/* ============================================================
   FUNCTION 1: loadImage(event)

   WHEN IS IT CALLED?
     When the user picks a file. (onchange in index.html)

   WHAT IT DOES:
     - Reads the file from the user's computer
     - Creates an Image object
     - Draws it on the left canvas (Original)
     - Shows the canvas boxes
     - Enables the Cartoonify button
   ============================================================ */
function loadImage(event) {

  // Get the file the user selected from their computer
  const file = event.target.files[0];

  // If user cancelled the picker without selecting, stop here
  if (!file) return;

  // FileReader: a browser tool that reads files from your device
  const reader = new FileReader();

  // This function runs automatically when the file is fully read
  reader.onload = function(e) {

    // Create a JavaScript Image object (like an <img> tag in memory)
    const img = new Image();

    // This function runs when the image is fully decoded and ready
    img.onload = function() {

      // Save the image so cartoonify() can use it later
      loadedImage = img;

      // ── Draw original image on the LEFT canvas ───────────
      const canvas = document.getElementById("originalCanvas");
      const ctx    = canvas.getContext("2d");  // get 2D drawing tool

      // Calculate display size — max 320px wide, keep ratio
      const maxWidth = 320;
      const scale    = Math.min(1, maxWidth / img.width);
      canvas.width   = img.width  * scale;
      canvas.height  = img.height * scale;

      // Draw the image onto the canvas at the calculated size
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // ── Show the canvas boxes (they were hidden by CSS) ───
      document.getElementById("originalBox").style.display = "block";
      document.getElementById("cartoonBox").style.display  = "block";

      // ── Enable the Cartoonify button ──────────────────────
      document.getElementById("cartoonBtn").disabled = false;

      // Update the status message
      document.getElementById("status").textContent =
        " Image loaded! Choose a style and click Cartoonify.";
    };

    // Set the image source to the file data (this triggers img.onload above)
    img.src = e.target.result;
  };

  // Tell FileReader to read the file as a base64 data URL string
  reader.readAsDataURL(file);
}


/* ============================================================
   FUNCTION 2: cartoonify()

   WHEN IS IT CALLED?
     When the user clicks the "Cartoonify!" button.

   WHAT IT DOES:
     - Gets the pixel data from the original canvas
     - Finds which style the user chose
     - Calls the right style function to modify the pixels
     - Puts the modified pixels onto the right canvas (Cartoon)
   ============================================================ */
function cartoonify() {

  // Safety check — if no image was loaded, do nothing
  if (!loadedImage) return;

  // Show "processing" message while working
  document.getElementById("status").textContent = "⏳ Processing your cartoon...";

  // ── Set up the RIGHT canvas (cartoon result) ─────────────
  const originalCanvas = document.getElementById("originalCanvas");
  const cartoonCanvas  = document.getElementById("cartoonCanvas");

  // Make cartoon canvas the same size as the original
  cartoonCanvas.width  = originalCanvas.width;
  cartoonCanvas.height = originalCanvas.height;

  const ctx = cartoonCanvas.getContext("2d");

  // Draw the original image onto the cartoon canvas first
  ctx.drawImage(loadedImage, 0, 0, cartoonCanvas.width, cartoonCanvas.height);

  // ── Read all pixel data from the canvas ──────────────────
  //
  // getImageData() returns an object with a 'data' array.
  // The array looks like:
  //   [R, G, B, A,  R, G, B, A,  R, G, B, A,  ...]
  //    pixel 1       pixel 2       pixel 3
  //
  // R = Red   (0 to 255)
  // G = Green (0 to 255)
  // B = Blue  (0 to 255)
  // A = Alpha/transparency (0 to 255) — we don't change this
  //
  const imageData = ctx.getImageData(0, 0, cartoonCanvas.width, cartoonCanvas.height);
  const pixels    = imageData.data;   // this is the flat array of numbers

  // ── Find which style the user selected ───────────────────
  const style = document.getElementById("styleSelect").value;

  // ── Call the matching style function ─────────────────────
  // Each function receives the 'pixels' array and modifies it
  if (style === "classic") applyClassic(pixels);
  if (style === "soft")    applySoft(pixels);
  if (style === "sketch")  applySketch(pixels);
  if (style === "vivid")   applyVivid(pixels);
  if (style === "anime")   applyAnime(pixels);

  // ── Write the modified pixels back onto the canvas ───────
  // Without this step, changes to 'pixels' won't be visible
  ctx.putImageData(imageData, 0, 0);

  // Update status and show download button
  document.getElementById("status").textContent = "🎉 Cartoon ready! Download it below.";
  document.getElementById("downloadBtn").style.display = "inline-block";
}


/* ============================================================
   FUNCTION 3: applyClassic(pixels)

   STYLE: Bold color blocks (classic cartoon look)

   HOW IT WORKS:
     Color quantization — rounds each color value to the
     nearest multiple of 40.

     Example:
       Red = 187  →  Math.round(187/40)*40  =  200
       Red = 210  →  Math.round(210/40)*40  =  200
       Red = 22   →  Math.round(22/40)*40   =  0

     This groups many similar colors into one flat color,
     creating the "painted block" look of cartoons.
   ============================================================ */
function applyClassic(pixels) {

  // Loop through every pixel — step by 4 (R, G, B, A per pixel)
  for (let i = 0; i < pixels.length; i += 4) {

    pixels[i]     = Math.round(pixels[i]     / 40) * 40;  // Red
    pixels[i + 1] = Math.round(pixels[i + 1] / 40) * 40;  // Green
    pixels[i + 2] = Math.round(pixels[i + 2] / 40) * 40;  // Blue
    // pixels[i + 3] = Alpha — we skip this (don't change transparency)
  }
}


/* ============================================================
   FUNCTION 4: applySoft(pixels)

   STYLE: Watercolor / soft painterly look

   HOW IT WORKS:
     1. Larger quantization step (50) = fewer shades = softer look
     2. Add a warm tint:
          + red   = warmer feeling
          - blue  = less cool, more sunset/pastel

     The warm tint simulates watercolor paper's warmth.
   ============================================================ */
function applySoft(pixels) {

  for (let i = 0; i < pixels.length; i += 4) {

    // Step 1: Quantize with bigger steps for softer blending
    let r = Math.round(pixels[i]     / 50) * 50;
    let g = Math.round(pixels[i + 1] / 50) * 50;
    let b = Math.round(pixels[i + 2] / 50) * 50;

    // Step 2: Add warm tint
    // Math.min(255, ...) stops the value from going above 255
    // Math.max(0, ...)   stops the value from going below 0
    pixels[i]     = Math.min(255, r + 15);   // more red = warmer
    pixels[i + 1] = Math.min(255, g + 5);    // slight green boost
    pixels[i + 2] = Math.max(0,   b - 20);   // less blue = warmer
  }
}


/* ============================================================
   FUNCTION 5: applySketch(pixels)

   STYLE: Pencil sketch / black and white

   HOW IT WORKS:
     Convert every pixel to a shade of grey.
     Grey formula = weighted average of R, G, B:
       Grey = (R × 0.30) + (G × 0.59) + (B × 0.11)

     Why weighted? Because human eyes are more sensitive to
     green light, and least sensitive to blue.

     Then set R = G = B = that grey value.
     Equal R, G, B = neutral grey (no color).
   ============================================================ */
function applySketch(pixels) {

  for (let i = 0; i < pixels.length; i += 4) {

    // Calculate grey brightness from the 3 color channels
    const grey = (pixels[i]     * 0.30)   // 30% of Red
               + (pixels[i + 1] * 0.59)   // 59% of Green
               + (pixels[i + 2] * 0.11);  // 11% of Blue

    // Set all three channels to the same grey value
    // This removes all color, leaving only light vs dark
    pixels[i]     = grey;   // Red
    pixels[i + 1] = grey;   // Green
    pixels[i + 2] = grey;   // Blue
  }
}


/* ============================================================
   FUNCTION 6: applyVivid(pixels)

   STYLE: High contrast pop-art / vivid colors

   HOW IT WORKS:
     Contrast formula:
       newValue = factor × (oldValue - 128) + 128

     With factor = 2.0:
       - Colors brighter than grey (>128) get BRIGHTER
       - Colors darker than grey  (<128) get DARKER
       - Grey stays exactly grey  (=128)

     This stretches the color range to make everything "pop".

     Example:
       Red = 180  → 2×(180-128)+128 = 232  (brighter red)
       Red = 60   → 2×(60-128)+128  = -8   → clamped to 0 (darker)
   ============================================================ */
function applyVivid(pixels) {

  const factor = 2.0;   // contrast strength (higher = more vivid)

  for (let i = 0; i < pixels.length; i += 4) {

    // Apply contrast formula to each channel
    // clamp() keeps the result between 0 and 255
    pixels[i]     = clamp(factor * (pixels[i]     - 128) + 128);  // Red
    pixels[i + 1] = clamp(factor * (pixels[i + 1] - 128) + 128);  // Green
    pixels[i + 2] = clamp(factor * (pixels[i + 2] - 128) + 128);  // Blue
  }
}


/* ============================================================
   FUNCTION 7: applyAnime(pixels)

   STYLE: Anime / cel-shading (very flat blocks of color)

   HOW IT WORKS:
     Quantize each channel to multiples of 64.
     This gives only these possible values: 0, 64, 128, 192, 256

     That's only 5 shades per channel vs 256 normally.
     Result: very flat, limited palette — just like anime!

     Example:
       Red = 100  → Math.round(100/64)*64 = 1*64 = 64
       Red = 200  → Math.round(200/64)*64 = 3*64 = 192
   ============================================================ */
function applyAnime(pixels) {

  for (let i = 0; i < pixels.length; i += 4) {

    pixels[i]     = Math.round(pixels[i]     / 64) * 64;   // Red
    pixels[i + 1] = Math.round(pixels[i + 1] / 64) * 64;   // Green
    pixels[i + 2] = Math.round(pixels[i + 2] / 64) * 64;   // Blue
  }
}


/* ============================================================
   HELPER FUNCTION: clamp(value)

   WHAT IT DOES:
     Keeps a number within the valid pixel range: 0 to 255.
     Pixel values MUST stay in 0–255 or the canvas breaks.

     Examples:
       clamp(300) → 255   (too high, brought down to max)
       clamp(-10) → 0     (too low, brought up to min)
       clamp(128) → 128   (fine, returned as-is)
   ============================================================ */
function clamp(value) {
  if (value < 0)   return 0;
  if (value > 255) return 255;
  return value;
}


/* ============================================================
   FUNCTION 8: downloadCartoon()

   WHEN IS IT CALLED?
     When the user clicks "Download My Cartoon".

   WHAT IT DOES:
     - Reads the cartoon canvas as a PNG image
     - Creates a fake download link in memory
     - Clicks it automatically to trigger the download
   ============================================================ */
function downloadCartoon() {

  // Get the cartoon canvas element
  const canvas = document.getElementById("cartoonCanvas");

  // toDataURL() converts the canvas drawing into a PNG base64 string
  // It looks like: "data:image/png;base64,iVBORw0KGgo..."
  const imageURL = canvas.toDataURL("image/png");

  // Create an invisible <a> link element
  const link = document.createElement("a");

  // Set the download filename
  link.download = "my_cartoon.png";

  // Set the link destination to the PNG image data
  link.href = imageURL;

  // Programmatically click the link — triggers the download
  link.click();
}
