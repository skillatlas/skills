# seocli Command Reference — Researcher Skill

## Contents

- Seed stage commands (domain-based, competitor-based)
- Expansion commands
- Enrichment commands (volume, difficulty)
- SERP analysis commands
- AI visibility commands
- Output format flags
- Batch limits

---

## Seed Stage: Domain-Based (Path B)

### Keywords for site

```bash
seocli keywords-data google-ads keywords-for-site live \
  --target example.com \
  --location-code 2840 \
  --language-code en \
  --sort-by search_volume \
  --limit 200
```

Returns keywords Google Ads associates with the domain. Use as initial seed list.

### Categories for domain

```bash
seocli dataforseo-labs google categories-for-domain \
  --target example.com \
  --location-code 2840 \
  --location-name "United States" \
  --language-code en \
  --language-name English \
  --include-subcategories \
  --limit 20
```

Returns topical categories the domain covers. Use to brainstorm adjacent topics.

### Competitor discovery

```bash
seocli dataforseo-labs google competitors-domain \
  --target example.com \
  --location-code 2840 \
  --location-name "United States" \
  --language-code en \
  --language-name English \
  --limit 10 \
  --exclude-top-domains
```

Returns domains ranking for similar keywords. `--exclude-top-domains` removes Wikipedia, Amazon, etc.

---

## Seed Stage: Competitor-Based (Path C)

### Ranked keywords

```bash
seocli dataforseo-labs google ranked-keywords \
  --target competitor1.com \
  --location-code 2840 \
  --location-name "United States" \
  --language-code en \
  --language-name English \
  --limit 200 \
  --order-by "keyword_data.keyword_info.search_volume,desc"
```

Top keywords a domain ranks for, sorted by volume. Run once per competitor (up to 5).

### Domain intersection (gap analysis)

```bash
seocli dataforseo-labs google domain-intersection \
  --target1 competitor1.com \
  --target2 example.com \
  --location-code 2840 \
  --location-name "United States" \
  --language-code en \
  --language-name English \
  --limit 200 \
  --order-by "keyword_data.keyword_info.search_volume,desc"
```

Returns keywords where both domains appear in SERPs. Filter for keywords where target1 ranks and target2 doesn't — these are gap opportunities.

Save results to `workspace/seo/competitor-gaps/{competitor}.json`.

---

## Expansion Commands

### Keywords for keywords (primary expansion)

```bash
seocli keywords-data google-ads keywords-for-keywords live \
  --keywords "keyword1" \
  --keywords "keyword2" \
  --keywords "keyword3" \
  --location-code 2840 \
  --language-code en \
  --sort-by search_volume
```

Google Ads keyword suggestions. **Batch up to ~10 keywords per call** for efficiency.

### Keyword ideas (broader discovery)

```bash
seocli dataforseo-labs google keyword-ideas \
  --keywords "keyword1" \
  --keywords "keyword2" \
  --location-code 2840 \
  --location-name "United States" \
  --language-code en \
  --language-name English \
  --include-serp-info \
  --include-clickstream-data \
  --limit 500
```

Category-level discovery. `--include-serp-info` captures SERP feature data (reuse in clustering). `--include-clickstream-data` gives more accurate volume signals.

---

## SERP Analysis

### Organic SERP

```bash
seocli serp google organic live \
  --keyword "target keyword" \
  --location-code 2840 \
  --language-code en \
  --depth 10 \
  --device desktop
```

Returns top organic results. Extract: ranking URLs, People Also Ask questions, related searches, SERP features (featured snippet, video, images, knowledge panel, AI Overview indicator).

### AI Overview / AI Mode

```bash
seocli serp google ai-mode live \
  --keyword "target keyword" \
  --location-code 2840 \
  --language-code en \
  --device desktop
```

Returns AI Overview content and cited sources. Use to flag zero-click risk and AI Overview opportunities.

---

## Enrichment Commands

### Search volume and CPC

```bash
seocli keywords-data google-ads search-volume live \
  --keywords "kw1" \
  --keywords "kw2" \
  --keywords "kw3" \
  --location-code 2840 \
  --language-code en \
  --sort-by search_volume
```

**Batch limit: up to 700 keywords per call.**

Response fields per keyword: `search_volume` (monthly average), `cpc`, `competition` (0–1), `competition_level` (LOW/MEDIUM/HIGH), `monthly_searches` (12-month array for trend detection).

### Bulk keyword difficulty

```bash
seocli dataforseo-labs google bulk-keyword-difficulty \
  --keywords "kw1" \
  --keywords "kw2" \
  --location-code 2840 \
  --location-name "United States" \
  --language-code en \
  --language-name English
```

**Batch limit: up to 1,000 keywords per call.**

Returns `keyword_difficulty` (0–100). DataForSEO KD runs higher than Ahrefs/Semrush — a "30" here ≈ "20" in Ahrefs.

### Trend exploration (optional, user-requested)

```bash
seocli keywords-data dataforseo-trends explore \
  --keywords "keyword1" \
  --keywords "keyword2" \
  --location-code 2840 \
  --time-range past_12_months
```

Deeper trend analysis. Only run if the user specifically asks for trend data beyond basic direction.

---

## Prioritization: Existing Rankings Check

```bash
seocli dataforseo-labs google ranked-keywords \
  --target example.com \
  --location-code 2840 \
  --location-name "United States" \
  --language-code en \
  --language-name English \
  --limit 500 \
  --order-by "keyword_data.keyword_info.search_volume,desc"
```

Cross-reference against cluster pillar keywords to classify: Defend (1–3), Optimize (4–20), Evaluate (21+), Create (not ranking).

---

## Output Format Flags

All commands support these output controls:

```
--format json|jsonl|tsv     # Output format (default: json)
--output <file>             # Write to file instead of stdout
--fields <field,field>      # Field projection for jsonl/tsv
--unwrap <auto|tasks|results|items>  # Row selection for jsonl/tsv
```

Use `--format json` for structured processing. Use `--format tsv --fields` for quick inspection of specific columns.

---

## Batch Limits Summary

| Command | Max per call |
|---------|-------------|
| `search-volume live` | 700 keywords |
| `bulk-keyword-difficulty` | 1,000 keywords |
| `keywords-for-keywords live` | ~10 keywords (practical limit) |
| `keyword-ideas` | 20 seed keywords |
| `ranked-keywords` | 1,000 results via `--limit` |
| `domain-intersection` | 1,000 results via `--limit` |

Always batch to the maximum to minimize API call count.
