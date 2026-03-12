# seocli Command Reference — seo-team-the-general

Complete command reference organized by workflow step. All commands use `seocli` CLI with DataForSEO credentials (`DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`).

## Contents

- Competitor Identification (Step 1)
- Competitive Benchmarking (Step 2)
- Keyword Gap Analysis (Step 3)
- Content Gap Mapping (Step 4)
- Backlink Gap Analysis (Step 5)
- AI/GEO Gap Analysis (Step 6)
- Output Format Flags

## Competitor Identification (Step 1)

| Command | Purpose | Cost |
|---------|---------|------|
| `seocli dataforseo-labs google competitors-domain --target <domain> --location-code 2840 --language-code "en" --limit 20` | Find algorithmically similar competitors | 1 call |
| `seocli serp google organic --keyword <kw> --location-code 2840 --language-code "en" --depth 100` | Derive competitors from SERP (fallback when no domain provided) | 1 call per keyword |

## Competitive Benchmarking (Step 2)

### Batched Calls (prefer these)

| Command | Purpose | Cost |
|---------|---------|------|
| `seocli dataforseo-labs google bulk-traffic-estimation --targets '["d1.com","d2.com","d3.com"]' --location-code 2840 --language-code "en"` | Estimated traffic for all domains | 1 call |
| `seocli backlinks bulk-ranks --targets '["d1.com","d2.com","d3.com"]'` | Domain rank scores | 1 call |
| `seocli backlinks bulk-referring-domains --targets '["d1.com","d2.com","d3.com"]'` | Referring domain counts | 1 call |

### Per-Domain Calls

| Command | Purpose | Cost |
|---------|---------|------|
| `seocli dataforseo-labs google domain-rank-overview --target <domain> --location-code 2840 --language-code "en"` | Rank overview (keywords, visibility) | 1 call per domain |
| `seocli backlinks summary --target <domain>` | Backlink profile summary | 1 call per domain |
| `seocli dataforseo-labs google categories-for-domain --target <domain> --location-code 2840 --language-code "en"` | Topical categories | 1 call per domain |

## Keyword Gap Analysis (Step 3)

| Command | Purpose | Cost |
|---------|---------|------|
| `seocli dataforseo-labs google domain-intersection --target1 <your-domain> --target2 <competitor> --location-code 2840 --language-code "en" --limit 500` | Keyword overlap between two domains | 1 call per competitor |
| `seocli dataforseo-labs google ranked-keywords --target <domain> --location-code 2840 --language-code "en" --limit 1000` | Full keyword universe for a domain | 1 call per domain |
| `seocli keywords-data google-ads search-volume --keywords '["kw1","kw2",...]' --location-code 2840 --language-code "en"` | Volume + CPC (batch up to 700) | 1-2 calls |
| `seocli dataforseo-labs google bulk-keyword-difficulty --keywords '["kw1","kw2",...]' --location-code 2840 --language-code "en"` | KD scores (batch up to 1000) | 1 call |
| `seocli dataforseo-labs google search-intent --keywords '["kw1","kw2",...]' --location-code 2840 --language-code "en"` | Intent classification (batch up to 1000) | 1 call |

## Content Gap Mapping (Step 4)

| Command | Purpose | Cost |
|---------|---------|------|
| `seocli serp google organic --keyword <kw> --location-code 2840 --language-code "en" --depth 10` | Analyze what ranks for gap keywords | 1 call per keyword (10-20 samples) |
| `seocli on-page live --url <url>` | Check competitor page depth/structure | 1 call per page (5-10 samples) |
| `seocli dataforseo-labs google relevant-pages --target <domain> --location-code 2840 --language-code "en" --limit 100` | Competitor's top pages by traffic | 1 call per competitor |

## Backlink Gap Analysis (Step 5)

| Command | Purpose | Cost |
|---------|---------|------|
| `seocli backlinks domain-intersection --targets '["comp1.com","comp2.com"]' --exclude-targets '["yourdomain.com"]' --limit 100` | Referring domains linking to competitors, not you | 1 call |
| `seocli backlinks bulk-ranks --targets '["gap1.com","gap2.com"]'` | Authority of gap domains (batched) | 1 call |
| `seocli backlinks bulk-spam-score --targets '["gap1.com","gap2.com"]'` | Filter toxic prospects (batched) | 1 call |
| `seocli backlinks anchors --target <your-domain> --limit 50` | Your anchor text distribution | 1 call |

## AI/GEO Gap Analysis (Step 6)

### Tier 1 (always run)

| Command | Purpose | Cost |
|---------|---------|------|
| `seocli ai-optimization llm-mentions --target <domain>` | LLM mention count per domain | 1 call per domain |

### Tier 2 (always run)

| Command | Purpose | Cost |
|---------|---------|------|
| `seocli serp google ai-mode --keyword <kw> --location-code 2840 --language-code "en"` | AI Overview citation check | 1 call per keyword (top 10) |

### Tier 3 (conditional — only if user requests or Tier 1 shows significant gap)

| Command | Purpose | Cost |
|---------|---------|------|
| `seocli ai-optimization chat-gpt llm-responses --keyword <kw>` | ChatGPT response for query | 1 call per keyword |
| `seocli ai-optimization gemini llm-responses --keyword <kw>` | Gemini response for query | 1 call per keyword |
| `seocli ai-optimization perplexity llm-responses --keyword <kw>` | Perplexity response for query | 1 call per keyword |
| `seocli ai-optimization claude llm-responses --keyword <kw>` | Claude response for query | 1 call per keyword |

## Output Format Flags

All commands support these output controls:

```
--format json|jsonl|tsv     # Output format
--output <file>             # Write to file instead of stdout
--fields <field,field>      # Field projection for jsonl/tsv
--unwrap <auto|tasks|results|items>  # Row selection for jsonl/tsv
```

## Cost Summary by Run Type

| Run Type | Competitors | Estimated Total Calls |
|----------|------------|----------------------|
| Lean (3 competitors, 10 gap keyword samples, Tier 1+2 AI) | 3 | ~40-50 |
| Standard (3 competitors, 20 gap samples, Tier 1+2 AI) | 3 | ~60-75 |
| Deep (5 competitors, 30 gap samples, Tier 1+2+3 AI) | 5 | ~90-110 |
