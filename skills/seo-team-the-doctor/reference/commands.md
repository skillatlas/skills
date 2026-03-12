# SEO Doctor — seocli Command Reference

## Contents

- On-Page Crawl & Analysis
- Backlink Analysis
- Keyword & Ranking Estimates
- SERP Analysis
- AI Visibility
- Output format flags

---

## On-Page Crawl & Analysis

| Command | Purpose | Mode |
|---------|---------|------|
| `seocli on-page create --target <domain> [flags]` | Start async site crawl | Site-wide |
| `seocli on-page summary --id <task-id>` | Crawl results overview | Site-wide |
| `seocli on-page pages --id <task-id> --limit 500` | Per-page analysis data | Site-wide |
| `seocli on-page duplicate-content --id <task-id>` | Content duplication detection | Site-wide |
| `seocli on-page duplicate-tags --id <task-id> --type <type>` | Duplicate title/description detection (`duplicate_title` or `duplicate_description`) | Site-wide |
| `seocli on-page redirect-chains --id <task-id>` | Redirect chain mapping | Site-wide |
| `seocli on-page resources --id <task-id>` | Resource analysis (broken images, CSS, JS) | Site-wide |
| `seocli on-page live --url <url> [flags]` | Instant single-page analysis | Both |
| `seocli on-page lighthouse --url <url>` | Lighthouse audit (CWV, performance) | Both |
| `seocli on-page content-parsing --url <url>` | Extract and parse page content | Both |

### Crawl creation flags

| Flag | Purpose | When to use |
|------|---------|-------------|
| `--max-crawl-pages N` | Limit crawl scope | Always (100 for small, 500 for large) |
| `--enable-content-parsing` | Parse page content | Always |
| `--validate-micromarkup` | Check schema markup | Always |
| `--check-spell` | Spelling errors | Always |
| `--load-resources` | Check images, CSS, JS | Always |
| `--calculate-keyword-density` | Keyword density per page | Always for content sites |
| `--crawl-delay N` | Delay between requests (seconds) | Large/e-commerce sites |
| `--allow-subdomains` | Include subdomains | International sites with locale subdomains |
| `--enable-www-redirect-check` | Check www redirect | Pre-launch audits |

### Live page analysis flags

| Flag | Purpose |
|------|---------|
| `--load-resources` | Check resource loading |
| `--validate-micromarkup` | Validate schema markup |
| `--check-spell` | Check spelling |
| `--enable-content-parsing` | Parse content structure |

---

## Backlink Analysis

| Command | Purpose | Mode |
|---------|---------|------|
| `seocli backlinks summary --target <domain-or-url>` | Overall backlink profile metrics | Both |
| `seocli backlinks bulk-spam-score --targets <domain>` | Spam score assessment | Site-wide |
| `seocli backlinks referring-domains --target <domain> --limit 100` | Top referring domains | Site-wide |
| `seocli backlinks anchors --target <domain> --limit 50` | Anchor text distribution | Site-wide |
| `seocli backlinks bulk-ranks --targets <domain>` | Domain rank/authority scores | Site-wide |
| `seocli backlinks history --target <domain>` | Historical backlink trends | Site-wide (optional) |

---

## Keyword & Ranking Estimates

| Command | Purpose | Mode |
|---------|---------|------|
| `seocli labs bulk-ranking-keywords --targets <domain>` | Estimated keyword count and top keywords | Site-wide |
| `seocli labs domain-rank-overview --target <domain>` | Organic visibility metrics | Site-wide |
| `seocli labs bulk-traffic-estimation --targets <domain>` | Estimated organic traffic | Site-wide |
| `seocli labs ranked-keywords --target <domain>` | Detailed ranked keyword list | Both |

---

## SERP Analysis

| Command | Purpose | Mode |
|---------|---------|------|
| `seocli serp google organic live --keyword <kw> --depth <n>` | Live Google organic results | Single-page |
| `seocli serp google ai-mode live --keyword <kw>` | AI Overview content and citations | Both |

---

## AI Visibility

| Command | Purpose | Mode |
|---------|---------|------|
| `seocli ai-optimization llm-mentions --target <domain>` | Brand mentions across LLMs | Site-wide |
| `seocli ai-optimization chatgpt llm-responses --keyword <kw>` | ChatGPT responses for a query | Optional |
| `seocli ai-optimization gemini llm-responses --keyword <kw>` | Gemini responses for a query | Optional |
| `seocli ai-optimization claude llm-responses --keyword <kw>` | Claude responses for a query | Optional |
| `seocli ai-optimization perplexity llm-responses --keyword <kw>` | Perplexity responses for a query | Optional |

---

## Output Format Flags

All commands support:

```
--format json|jsonl|tsv     # Output format
--output <file>             # Write to file instead of stdout
--fields <field,field>      # Field projection for jsonl/tsv
--unwrap <auto|tasks|results|items>  # Row selection for jsonl/tsv
```
