# SEO Doctor — Scoring Rubrics

## Contents

- Site-wide: 5-dimension scoring model
- Site-wide: grade thresholds
- Single-page: 8-factor weighted rubric
- On-page spot-check rubric (site-wide Step 6)
- E-E-A-T signal checklist

---

## Site-Wide Scoring Model

Score each dimension 0–100, then combine with weights:

```
Overall SEO Score = Σ (dimension_score × dimension_weight)
```

### Dimension 1: Technical Health (30%)

| Signal | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| 4xx/5xx error rate | <1% of pages | 1–5% | >5% |
| Redirect chains | None >2 hops | 1–5 chains >2 hops | >5 chains or chains to key pages |
| Broken resources | <5 broken | 5–20 broken | >20 broken |
| Mixed HTTP/HTTPS | None | <5 pages | >5 pages |
| Robots.txt blocks | Only intended blocks | Googlebot partially blocked | Googlebot fully blocked |
| AI bot access | OAI-SearchBot, PerplexityBot allowed | Some blocked | All AI bots blocked |
| Sitemap | Present, valid | Present, stale | Missing |
| Orphan pages | <5% of pages | 5–15% | >15% |
| Lighthouse Performance | ≥80 | 60–79 | <60 |
| LCP | <2.5s | 2.5–4s | >4s |
| CLS | <0.1 | 0.1–0.25 | >0.25 |
| INP | <200ms | 200–500ms | >500ms |

**Scoring heuristic:** Start at 100. Deduct points per signal based on severity: Critical signals deduct 15–25 each, Warnings deduct 5–10 each.

### Dimension 2: Content Quality (25%)

| Signal | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Thin content (<300 words) | <5% of pages | 5–15% | >15% |
| Duplicate content | <3% of pages | 3–10% | >10% |
| Duplicate titles | <3% | 3–10% | >10% |
| Duplicate descriptions | <5% | 5–15% | >15% |
| Spelling errors | <2 per page avg | 2–5 per page avg | >5 per page avg |
| Keyword density outliers | <5% of pages | 5–15% | >15% |
| Content freshness | >80% updated in last 12 months | 50–80% | <50% |
| E-E-A-T signals | ≥2 of 4 on most pages | 1 of 4 on most | None visible |

### Dimension 3: On-Page Optimisation (20%)

| Signal | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Missing title tags | 0 | 1–5 pages | >5 pages |
| Missing meta descriptions | <10% | 10–30% | >30% |
| Missing H1 | 0 | 1–3 pages | >3 pages |
| Heading hierarchy issues | <5% of pages | 5–15% | >15% |
| Missing image alt text | <20% images | 20–50% | >50% |
| Pages with <3 internal links | <10% | 10–30% | >30% |
| Missing/invalid schema | <30% pages missing | 30–70% | >70% |
| Missing canonical tags | <5% | 5–20% | >20% |

### Dimension 4: Backlink Profile (15%)

| Signal | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Domain rank | >40 | 20–40 | <20 |
| Referring domain diversity | Ratio >0.3 | 0.1–0.3 | <0.1 |
| Spam score | <15 | 15–30 | >30 |
| Exact-match anchor % | <15% | 15–30% | >30% |
| Referring domain count | >100 | 20–100 | <20 |

### Dimension 5: AI Visibility (10%)

| Signal | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| LLM platform mentions | ≥3 platforms | 1–2 platforms | 0 platforms |
| AI Overview citations | Cited for ≥50% of checked keywords | 10–50% | <10% |
| llms.txt | Present with meaningful content | Present but minimal | Missing |
| Mention sentiment | Positive/neutral | Mixed | Negative dominant |

---

## Grade Thresholds

| Score | Grade | Interpretation |
|-------|-------|---------------|
| 90–100 | A+ | Excellent — minor polish only |
| 80–89 | A | Strong — a few opportunities |
| 70–79 | B | Good foundation, notable gaps |
| 60–69 | C | Needs work — several important issues |
| 40–59 | D | Significant problems across dimensions |
| 0–39 | F | Critical issues blocking performance |

---

## Single-Page Scoring Rubric (8-Factor)

Used in Single-Page Audit Mode (Step 3) and shared with `seo-team-the-writer` for validation consistency.

| Factor | Weight | Pass Criteria |
|--------|--------|---------------|
| **Title Tag** | 15% | Primary keyword present, 50–60 chars, compelling copy, not generic |
| **Headers** | 10% | H1 with keyword, logical H2/H3 hierarchy, subtopics covered |
| **Content** | 25% | Depth (word count vs competitors), comprehensiveness, freshness, E-E-A-T signals |
| **Keywords** | 15% | Primary in title/H1/first 100 words/URL, secondary distributed, density 0.5–2.5% |
| **Internal Links** | 10% | Inbound count from site, outbound to related content, descriptive anchors |
| **Images** | 10% | Alt text coverage, compression, relevance, lazy loading |
| **Technical** | 10% | Page speed, mobile rendering, schema presence/validity, canonical tag |
| **Meta** | 5% | Description quality + length (105–160 chars), OG tags, Twitter cards |

**Scoring:** Each factor scored 0–100, then weighted. Same grade thresholds as site-wide.

---

## On-Page Spot-Check Rubric (Site-Wide Step 6)

Applied to top 20 pages by internal link count or estimated traffic:

| Factor | Check | Passing Criteria |
|--------|-------|-----------------|
| Title Tag | Present, unique, length, keyword inclusion | 50–60 chars, primary keyword present |
| Meta Description | Present, unique, length, CTA presence | 150–160 chars, keyword included, has CTA |
| H1 | Present, unique per page, keyword inclusion | Exactly one H1, includes primary keyword |
| Heading Hierarchy | Logical H1→H2→H3 | No skipped levels, keyword variations in H2s |
| Image Alt Text | Coverage percentage | Flag pages with >50% missing alt text |
| Internal Links | Count per page | Flag pages with <3 internal links |
| Schema Markup | Present, valid, correct type | From micromarkup validation in crawl |
| Content Freshness | Publish/update dates | Flag pages >12 months without updates |

---

## E-E-A-T Signal Checklist

For high-value pages, check for presence of:

1. **Author credentials visible** — byline with qualifications or bio link
2. **Expert quotes present** — named expert opinions or testimonials
3. **Original data/statistics cited** — proprietary research, surveys, or analysis
4. **Authoritative sources linked** — outbound links to reputable references

Flag pages where ≥2 of 4 signals are present. E-E-A-T contributes to the Content Quality dimension in site-wide scoring.

For YMYL topics (health, finance, legal), raise the bar: require ≥3 of 4 signals.
