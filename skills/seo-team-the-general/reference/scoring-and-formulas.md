# Scoring & Formulas — seo-team-the-general

All scoring formulas, effort level definitions, and opportunity scoring logic used by the strategist.

## Contents

- Quick Win Score Formula
- Effort Level Definitions
- Quick Win Type Detection
- Opportunity Score (Keyword Gap)
- Share of Voice Calculation
- CTR Estimates by Position

## Quick Win Score Formula

```
Quick Win Score = (estimated_traffic_potential × intent_weight) / (effort_level × 10)
```

**Variables:**

`estimated_traffic_potential = volume × CTR_for_target_position`

Position CTR estimates:
| Position | CTR |
|----------|-----|
| 1 | 30% |
| 3 | 12% |
| 5 | 6% |
| 10 | 2% |

`intent_weight`:
| Intent | Weight |
|--------|--------|
| Informational | 1 |
| Commercial | 2 |
| Transactional | 3 |

`effort_level`: 1-5 scale (see below).

## Effort Level Definitions

| Level | Description | Time Estimate |
|-------|-------------|---------------|
| 1 | Technical fix (add schema, fix redirect, create llms.txt, disavow) | < 1 hour |
| 2 | Content refresh (update stats, add sections, refresh date) | 2-4 hours |
| 3 | New article or format conversion | 4-8 hours |
| 4 | Pillar content + supporting cluster | Multi-day, 20-40 hours |
| 5 | Interactive tool or original research | 40-80+ hours |

## Quick Win Type Detection

Cross-reference data from Steps 2-6 to surface highest-ROI, lowest-effort opportunities:

| Quick Win Type | Source Step | Detection Logic | Effort |
|---------------|-----------|-----------------|--------|
| Low-difficulty gaps | Step 3 keyword gaps | Competitor ranks, you don't, KD < 30, volume > 100 | 3 |
| Depth upgrades | Step 4 content gaps | Your page < 500 words, competitor > 2,000 words | 2 |
| Format fixes | Step 4 content gaps | Your format doesn't match SERP expectations | 2 |
| Internal linking fixes | Step 4 + audit data | High-authority pages not linking to strategic content | 1 |
| Content refreshes | Step 4 freshness gaps | Your content > 12 months old, competitors updated recently | 2 |
| Missing schema | Audit data | Pages without structured data where competitors have it | 1 |
| Missing llms.txt | Step 6 AI analysis | No `/llms.txt` file on your domain | 1 |
| Anchor text cleanup | Step 5 backlinks | Over-optimized or suspicious anchor distribution | 1 |
| Unlinked brand mentions | Step 5 + search | Sites mention your brand but don't link | 2 |

## Opportunity Score (Keyword Gap — Step 3)

Used to prioritize attack keywords:

```
opportunity = volume × intent_weight / difficulty
```

Intent weights: informational = 1, commercial = 2, transactional = 3.

For **improve bucket** keywords, weight closer gaps higher. A page at position 6 vs competitor position 3 is more actionable than position 45 vs position 2. Use position delta as a multiplier:

```
improve_priority = opportunity × (1 / position_delta)
```

Where `position_delta = your_position - their_position`.

## Share of Voice (SOV)

Tracks overall competitive position across strategy runs.

```
SOV = (keywords ranked top 10) / (total keywords checked) × 100
```

**Keyword universe:** Use the target keyword set from `keyword-map.json` if available. Otherwise, use the union of keywords discovered in Step 3.

Calculate SOV for your domain and each competitor. Compare to previous run if available — report as: increasing, stable, or declining.

## Competitor Battlecard Template

One per competitor. Include in strategy output:

```
## [competitor.com] — Battlecard

**Domain Rank:** [X] | **Est. Traffic:** [X]/mo | **SOV:** [X]%

**Strengths:**
- [e.g., Strong backlink profile — 3x your referring domains]
- [e.g., Deep content on [topic cluster] — 8 pages vs your 1]

**Weaknesses:**
- [e.g., No AI visibility — 0 LLM mentions vs your 12]
- [e.g., Thin content on [topic] — 400 words vs SERP avg 2,500]

**Strategy Patterns:**
- [e.g., Publishing 2-3 comparison pages per month]
- [e.g., Heavy investment in FAQ schema across all pages]

**Key Pages:** [top 3-5 pages by traffic]

**Backlink Advantage:** [specific domains linking to them, not you]

**AI Visibility:** [LLM mention count, AI Overview citations]
```
