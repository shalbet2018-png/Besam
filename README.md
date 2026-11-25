# Besam Logistics website

New website for **Besam Logistics Limited**, Athi River, Kenya: equipment hire, earthworks, murram/sand/ballast supply and delivery, and glass, aluminium and stainless steel finishes.

A plain static site (HTML, CSS, JavaScript). No build step, no server, so it runs on GitHub Pages, Netlify, cPanel or any host.

## What's in it

- **3D animated background** (Three.js, bundled locally in `js/vendor/`): a night-time Besam yard with an excavator digging, a 5-ton shovel loading, tipper trucks driving a ring road, murram/sand/ballast piles, and a Saturn-style ringed planet whose rings are made of gravel. The camera flies through the scene as you scroll. It pauses when the tab is hidden, uses fewer effects on phones, and respects "reduce motion".
- **Sticky scroll story**: "From dig to delivery". The image stays pinned while the five steps scroll past and swap the picture.
- **Fixed-image bands**: full-screen images that stay still while the page scrolls over them (works on iPhone too).
- **Route animation**: a truck drives along the "How it works" route as you scroll.
- **WhatsApp everywhere**: a floating button plus pre-filled messages on every machine, material and service.
- **Working quote form**: builds a tidy message and opens WhatsApp to 0721 567 157, or opens an email to besamlogistics22@gmail.com. "Use my location" adds a Google Maps pin. No backend is needed, so it can't break the way the old form did.
- **Correct map pin**: BE-Energy, Mombasa Road, Athi River (-1.4476324, 36.9980482), not the Syokimau pin on the old site.
- **SEO**: a correct meta description, Open Graph tags, LocalBusiness schema with the 5.0 Google rating, and area keywords.
- **Analytics hooks**: if Google Analytics (`gtag`) is added, quote, call and WhatsApp clicks are tracked automatically.

## Placeholders to replace before launch

Anything Besam still needs to confirm is tagged on the page with a dashed amber **CONFIRM** label. Search `class="tbc"` in `index.html` to find them all: rates, machine sizes, delivery zones, opening days, founding year, NCA category, founder story and payment methods.

When everything is confirmed, **remove `class="show-draft"` from the `<body>` tag**. That hides every CONFIRM label and the "Preview draft" notice.

### Images

The images in `images/` are original 3D renders made from the same models as the background (`tools/shots.js`). Swap them for Besam's own photos using the **same file names** and roughly 16:10 landscape at 1600×1000:

| File | Use |
|---|---|
| `excavator.jpg` | Hero story step 1, excavator card |
| `earthworks.jpg` | Story step 2 |
| `materials.jpg` | Story step 3 |
| `truck.jpg` | Story step 4, tipper card, "peace of mind" band |
| `glass.jpg` | Story step 5, glass & steel section |
| `loader.jpg` | 5-ton shovel card |
| `planet.jpg` | #jenganabesam band |
| `logo-mark.svg` | Placeholder logo: replace with Besam's real logo file |

To re-render the 3D images: `node tools/render-images.mjs` (needs Node and Playwright).

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` straight from disk won't load the 3D scene, because browsers block JavaScript modules on `file://`.)

## Publish on GitHub Pages

Settings → Pages → Source: "Deploy from a branch" → Branch `main`, folder `/ (root)`. The site appears at `https://<user>.github.io/besam/`. To use `besamlogistics.co.ke`, add the domain under Pages → Custom domain and point the DNS at GitHub.

## Files

```
index.html          the whole page
css/style.css       styles (palette: plum #1d0814, rust #821d11, sand #ad7d4e, green #0f4c25, maroon-brown #2a0a0b)
js/main.js          nav, scroll effects, WhatsApp links, quote form
js/scene.js         3D background scene
js/models.js        low-poly excavator, loader, tipper, piles, glass building, ringed planet
js/vendor/          Three.js r170 (MIT)
images/             renders and logo
tools/              image render scripts
```
