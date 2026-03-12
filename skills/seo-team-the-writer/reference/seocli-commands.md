# seocli Command Reference — Writer Skill

## Contents

- Primary commands (every run)
- Enrichment commands (when needed)
- Competitor intelligence commands (single-page optimization)
- Output format flags

---

## Primary Commands (Every Run)

These three commands form the foundation of every content brief.

### Organic SERP Analysis

```bash
seocli serp google organic live \
  --keyword "[target keyword]" \
  --location-code 2840 \
  --language-code en \
  --depth 20 \
  --format json
```

Returns top 20 organic results. Extract: content formats, common H2 topics,
average content length, SERP features, PAA questions, related searches.

### AI Overview Analysis

```bash
seocli serp google ai-mode live \
  --keyword "[target keyword]" \
  --location-code 2840 \
  --language-code en \
  --format json
```

Returns AI Overview content and cited sources. Extract: what it covers (floor
to exceed), cited URLs, favored format, gaps.

### Secondary Keyword Expansion

```bash
seocli keywords-data google-ads keywords-for-keywords live \
  --keywords "[target keyword]" \
  --location-code 2840 \
  --language-code en \
  --format json
```

Returns related keyword suggestions from Google Ads data. Extract: top 10-20
by volume, question variants, long-tail variants for subheadings.

---

## Enrichment Commands (When Needed)

### Search Volume & CPC

```bash
seocli keywords-data google-ads search-volume live \
  --keywords "[kw1]" \
  --keywords "[kw2]" \
  --keywords "[kw3]" \
  --location-code 2840 \
  --language-code en \
  --format json
```

Batch up to 700 keywords per call. Returns: `search_volume`, `cpc`,
`competition`, `competition_level`, `monthly_searches` (12 months).

### Keyword Difficulty

```bash
seocli dataforseo-labs google bulk-keyword-difficulty \
  --keywords "[kw1]" \
  --keywords "[kw2]" \
  --keywords "[kw3]" \
  --location-code 2840 \
  --language-code en \
  --format json
```

Batch up to 1,000 keywords per call. Returns `keyword_difficulty` (0-100).
Note: DataForSEO KD tends to run higher than Ahrefs/Semrush scales.

### Content Sentiment & Citation

```bash
seocli content-analysis search \
  --keyword "[target keyword]" \
  --search-mode one_per_domain \
  --limit 10 \
  --format json

seocli content-analysis sentiment-analysis \
  --keyword "[target keyword]" \
  --format json
```

Use for commercial/transactional keywords to understand tone and framing of
existing content.

---

## Competitor Intelligence Commands (Single-Page Optimization)

### Live Page Audit

```bash
seocli on-page instant-pages \
  --url "[URL]" \
  --enable-javascript \
  --enable-browser-rendering \
  --load-resources \
  --format json
```

Run for the user's page AND each top-ranking competitor page.

### Content Extraction

```bash
seocli on-page content-parsing \
  --url "[page URL]" \
  --markdown-view \
  --format json
```

Returns page content as markdown for gap comparison.

### Backlink Profile

```bash
seocli backlinks summary --target "[URL]" --format json
```

Compare referring domain counts and authority across pages.

### Keyword Overlap

```bash
seocli dataforseo-labs google page-intersection \
  --json '{"pages":["url1","url2"]}' \
  --format json
```

Find keywords both pages rank for.

---

## Output Format Flags

All commands support these output controls:

```
--format json|jsonl|tsv     # Output format
--output <file>             # Write to file instead of stdout
--fields <field,field>      # Field projection for jsonl/tsv
--unwrap <auto|tasks|results|items>  # Row selection for jsonl/tsv
```

---

## Cost Summary

| Workflow | Typical API Calls |
|---|---|
| Content brief only | 2-3 |
| Full brief + draft + optimization | 3-5 |
| Single-page optimization | 5-8 |
| Full brief + draft + competitor deep-dive | 8-12 |

**Batch aggressively:** search-volume takes 700 keywords/call,
bulk-keyword-difficulty takes 1,000/call. Don't call one-at-a-time.
