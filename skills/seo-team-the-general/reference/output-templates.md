# Output Templates — seo-team-the-general

Standard table formats and report structures for all strategist deliverables.

## Contents

- Competitive Landscape Table (Step 2)
- Keyword Gap Matrix (Step 3)
- Content Gap Report (Step 4)
- Backlink Gap Report (Step 5)
- AI/GEO Visibility Report (Step 6)
- Quick Wins Report (Step 7)
- Strategic Plan Structure (Step 7)
- Handoff Protocol (Step 8)

## Competitive Landscape Table (Step 2)

| Domain          | Est. Traffic | Est. Keywords | Share of Voice | Backlinks | Ref. Domains | Domain Rank | Primary Categories |
| --------------- | ------------ | ------------- | -------------- | --------- | ------------ | ----------- | ------------------ |
| yourdomain.com  | ...          | ...           | ...%           | ...       | ...          | ...         | ...                |
| competitor1.com | ...          | ...           | ...%           | ...       | ...          | ...         | ...                |
| competitor2.com | ...          | ...           | ...%           | ...       | ...          | ...         | ...                |

Follow with a **key insight narrative**: who's winning, who's growing, where you sit in the pack, SOV trend vs previous run (if available).

## Keyword Gap Matrix (Step 3)

One table per competitor:

| Keyword   | Your Pos. | Their Pos. | Volume | KD  | Intent        | Bucket  | Opportunity Score |
| --------- | --------- | ---------- | ------ | --- | ------------- | ------- | ----------------- |
| [keyword] | --        | 4          | 2,400  | 35  | commercial    | Attack  | 137               |
| [keyword] | 12        | 3          | 1,800  | 42  | informational | Improve | 43                |
| [keyword] | 5         | --         | 900    | 28  | transactional | Defend  | --                |

**Bucket definitions:**

- **Attack:** They rank, you don't. New content opportunities.
- **Improve:** Both rank, they're higher. Optimization targets.
- **Defend:** Only you rank. Protect these.

## Content Gap Report (Step 4)

| Gap Type          | Topic/Keyword Cluster | Competitor Coverage       | Your Coverage        | Priority | Recommended Action               |
| ----------------- | --------------------- | ------------------------- | -------------------- | -------- | -------------------------------- |
| Topic             | "[topic area]"        | 8 pages, ~12K words       | 0 pages              | P0       | Create pillar + 3 supporting     |
| Depth             | "[keyword]"           | 2,800 words, FAQ schema   | 450 words, no schema | P1       | Expand existing page             |
| Format            | "[keyword]"           | Comparison table + scores | Blog post            | P1       | Reformat to comparison           |
| Freshness         | "[keyword]"           | Updated Jan 2026          | Published Mar 2024   | P2       | Content refresh                  |
| Angle             | "[keyword]"           | "for SaaS" variant        | Generic only         | P2       | Create audience-specific version |
| Cluster Authority | "[topic cluster]"     | 8 pages                   | 1 page               | P0       | Build content hub                |

**Priority levels:**

- **P0:** Major gap with high traffic potential. Act immediately.
- **P1:** Significant gap, clear ROI. Schedule this month.
- **P2:** Moderate gap. Schedule this quarter.

## Backlink Gap Report (Step 5)

| Referring Domain  | Links to Comp1 | Links to Comp2 | Links to You | Domain Rank | Spam Score | Topic Relevance |
| ----------------- | -------------- | -------------- | ------------ | ----------- | ---------- | --------------- |
| industry-blog.com | 3              | 5              | 0            | 72          | 5          | High            |
| resource-site.org | 1              | 2              | 0            | 65          | 8          | Medium          |

Follow with **anchor text health summary** for your domain: distribution breakdown, over-optimization flags, suspicious pattern alerts.

## AI/GEO Visibility Report (Step 6)

| Metric                               | You | Comp1 | Comp2 | Comp3 |
| ------------------------------------ | --- | ----- | ----- | ----- |
| LLM Mentions (total)                 | 12  | 45    | 32    | 28    |
| AI Overview Citations (of N queries) | 2   | 8     | 6     | 5     |
| llms.txt present                     | No  | Yes   | No    | No    |

Follow with **AI Citation Gap List**: queries where competitors are cited and you aren't, with analysis of structural patterns the cited content uses (stats, numbered lists, definitions, Q&A format).

## Quick Wins Report (Step 7)

| Rank | Quick Win                     | Type             | Target          | Est. Traffic Potential | Effort    | Score | Action          |
| ---- | ----------------------------- | ---------------- | --------------- | ---------------------- | --------- | ----- | --------------- |
| 1    | Add FAQ schema to /guides/seo | Missing schema   | /guides/seo     | +120 visits/mo         | 1 (<1hr)  | 36    | Add JSON-LD     |
| 2    | Create llms.txt               | Missing llms.txt | /               | — (AI visibility)      | 1 (<1hr)  | —     | Create file     |
| 3    | Expand /blog/crm-guide        | Depth upgrade    | /blog/crm-guide | +340 visits/mo         | 2 (2-4hr) | 34    | Add 2,000 words |

## Strategic Plan Structure (Step 7)

```markdown
# SEO Strategy: [Domain] — [Date]

## Executive Summary

[3-5 sentence overview: current position, biggest gaps, top recommended actions]

## Competitive Position

[Landscape table + SOV + key narrative]

## Immediate Actions (This Week)

1. [Quick win 1 — effort level 1]
2. [Quick win 2 — effort level 1]
3. [Top content refresh — effort level 2]

## Short-Term (This Month)

1. [Low-difficulty content gap — KD < 30, volume > 100]
2. [Depth upgrade for existing thin content]
3. [Format fix for SERP-mismatched page]

## Medium-Term (This Quarter)

1. [New topic cluster build for major gap]
2. [Supporting content for improve-bucket keywords]
3. [Backlink outreach to top 10 warm targets]

## Long-Term (6+ Months)

1. [High-difficulty keyword clusters — KD > 60]
2. [Link-worthy asset creation]
3. [AI authority building — structured content for GEO]

## Competitor Battlecards

[One card per competitor — see scoring-and-formulas.md for template]

## Next Actions (Machine-Readable)

[next_actions JSON — see Handoff Protocol below]
```

## Handoff Protocol (Step 8)

Every strategy run ends with this JSON structure saved to `workspace/seo/strategy/`:

```json
{
  "run_date": "YYYY-MM-DD",
  "domain": "yourdomain.com",
  "competitors_analyzed": ["comp1.com", "comp2.com", "comp3.com"],
  "sov": { "yourdomain.com": 12.5, "comp1.com": 28.3, "comp2.com": 19.7 },
  "next_actions": [
    {
      "skill": "seo-team-the-researcher",
      "action": "Deep keyword research for '[topic]' gap cluster",
      "priority": "high",
      "keywords": ["kw1", "kw2"],
      "clusters": ["cluster1"]
    },
    {
      "skill": "seo-team-the-writer",
      "action": "Create comparison page for '[keyword]'",
      "priority": "high",
      "content_type": "comparison",
      "briefing": {
        "topic": "...",
        "angle": "...",
        "suggested_competitors": ["Brand A", "Brand B"],
        "estimated_word_count": 2500,
        "internal_links": ["existing-guide", "checklist"]
      }
    },
    {
      "skill": "seo-team-the-doctor",
      "action": "Add FAQ schema to flagged pages",
      "priority": "medium",
      "pages": ["/page1", "/page2"],
      "schema_type": "FAQ"
    },
    {
      "skill": "seo-team-the-writer",
      "action": "Refresh content on /blog/guide — competitor 6 months newer",
      "priority": "medium",
      "page_url": "/blog/guide",
      "refresh_type": "update_date_and_examples",
      "estimated_hours": 3
    }
  ]
}
```

## File Naming Convention

All strategy outputs saved to `workspace/seo/strategy/`:

```
workspace/seo/strategy/
├── {domain}-strategy-{YYYY-MM-DD}.md          # Full strategy report
├── {domain}-landscape-{YYYY-MM-DD}.json       # Competitive landscape data
├── {domain}-quick-wins-{YYYY-MM-DD}.json      # Quick wins list
└── {domain}-next-actions-{YYYY-MM-DD}.json    # Handoff protocol
```

Gap data saved separately for downstream skill consumption:

```
workspace/seo/competitor-gaps/
├── {competitor1-domain}.json
├── {competitor2-domain}.json
└── {competitor3-domain}.json
```
