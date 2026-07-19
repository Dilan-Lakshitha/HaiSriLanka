# Tours JSON guide

Adding a tour requires **no Angular code changes**.

## 1. Create the tour JSON

`src/assets/json/tours/items/{slug}.json`

Copy an existing file in that folder and edit fields.

## 2. Register the tour

Add an entry to `src/assets/json/tours/manifest.json`:

```json
{ "slug": "your-tour-slug", "category": "day", "status": "published" }
```

## 3. Add images

Place images under:

`src/assets/images/tours/{slug}/`

Recommended:

- `hero.webp`
- `gallery-01.webp`, `gallery-02.webp`, …

Point `heroImage.src` and `gallery[].src` at those paths.

## Key fields

`title`, `seoTitle`, `metaDescription`, `heroImage`, `gallery`, `duration`,
`destinations`, `travelStyle`, `highlights`, `overview`, `included`, `excluded`,
`itinerary`, `faqs`, `reviews`, `pricing`, `relatedTours`, `badges`, `tags`,
`route`, `mapsUrl`
