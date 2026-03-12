# Clustering Algorithm — Detailed Guide

## Contents

- SERP similarity algorithm (step-by-step)
- Cluster metadata fields
- Completeness scoring formula
- Content format inference table

---

## SERP Similarity Clustering

Two keywords belong in the same cluster if Google ranks the same pages for both — meaning it considers them the same topic.

### Step 1: Select Representative Keywords

Don't SERP-check every keyword (too expensive). Instead:

1. Sort all enriched keywords by volume (descending)
2. Take the top 30–50 keywords as **cluster candidates** (potential pillar keywords)
3. For remaining keywords, tentatively assign to the nearest candidate based on textual similarity (shared words, substring matching)

### Step 2: SERP Similarity Checking

For each candidate pair where textual similarity suggests overlap, pull both SERPs:

```bash
seocli serp google organic live \
  --keyword "candidate keyword A" \
  --location-code 2840 \
  --language-code en \
  --depth 10 \
  --device desktop
```

Extract the top 10 ranking domains from each SERP. Calculate URL overlap:

| Shared URLs in top 10 | Decision |
|----------------------|----------|
| 3+ | Same cluster (strong signal) |
| 2 | Likely same cluster — merge if textually similar |
| 0–1 | Different clusters |

### Step 3: Merge and Assign

After pairwise SERP comparison:

1. Merge candidates that cluster together. The highest-volume keyword becomes the **pillar keyword**.
2. Assign remaining keywords (not SERP-checked) to clusters based on textual similarity to the cluster's pillar keyword.
3. Keywords that don't fit any cluster become single-keyword clusters (potential standalone pieces or future expansion points).

### Cost Control

- Cap at 50 SERP calls total for clustering
- Reuse any SERP data cached during Stage 2 (expansion)
- Stop pairwise comparison early when clusters stabilize (no new merges in last 5 comparisons)
- For assignments beyond the SERP-checked set, note that SERP verification was not performed

---

## Cluster Metadata

Each cluster receives these fields:

| Field | How to Determine |
|-------|-----------------|
| `pillar_keyword` | Highest volume keyword in the cluster |
| `supporting_keywords` | All other keywords in the cluster |
| `total_volume` | Sum of all keyword volumes |
| `avg_difficulty` | Mean KD across cluster keywords |
| `dominant_intent` | Most common intent classification |
| `dominant_funnel_stage` | Most common funnel stage |
| `recommended_format` | Inferred from SERP analysis of pillar keyword (see table below) |
| `serp_features` | Union of all SERP features triggered by cluster keywords |
| `keyword_count` | Number of keywords in the cluster |
| `volume_distribution` | Max, min, median volume — flag if top keyword > 70% of cluster volume |
| `difficulty_spread` | Max, min, median KD — flag if no easy entry points (KD < 35) |
| `completeness_score` | 0–1 score (see formula below) |
| `status` | needs_expansion, ready_for_content, or monitor |

---

## Completeness Scoring

Score each cluster's viability on a 0–1 scale:

```
completeness = (keyword_count_score × 0.4) + (volume_distribution_score × 0.3) + (difficulty_spread_score × 0.3)
```

### Sub-score definitions

**Keyword count score (0–1):**

| Count | Score | Label |
|-------|-------|-------|
| 1 | 0.1 | underdeveloped |
| 2 | 0.3 | underdeveloped |
| 3–4 | 0.6 | moderate |
| 5–7 | 0.8 | well-developed |
| 8+ | 1.0 | well-developed |

**Volume distribution score (0–1):**

| Pattern | Score |
|---------|-------|
| Top keyword > 90% of cluster volume | 0.2 |
| Top keyword 70–90% of cluster volume | 0.5 |
| Top keyword 50–70% of cluster volume | 0.7 |
| Top keyword < 50% of cluster volume | 1.0 |

**Difficulty spread score (0–1):**

| Pattern | Score |
|---------|-------|
| All keywords KD > 60 (no easy entry) | 0.2 |
| Some keywords KD < 60 but none < 35 | 0.5 |
| At least one keyword KD < 35 | 0.8 |
| Mixed spread (some < 20, some > 40) | 1.0 |

### Status Flags

| Score Range | Status | Meaning |
|-------------|--------|---------|
| < 0.4 | `needs_expansion` | Too few keywords or too concentrated — research more |
| 0.4–0.7 | `monitor` | Between states — may become viable with a few more keywords |
| > 0.7 | `ready_for_content` | Sufficient keywords, good distribution — hand to seo-team-the-writer |

---

## Content Format Inference

Analyze what format Google rewards for the pillar keyword's SERP:

| SERP Signal | Recommended Format |
|------------|-------------------|
| Top results are "X best…" listicles | Listicle |
| Top results are step-by-step guides | How-to guide |
| Top results compare products/services | Comparison page |
| Top results define a concept | Definition / explainer |
| Top results are comprehensive long-form | Pillar / ultimate guide |
| Top results are tool/calculator pages | Interactive tool page |
| Video results in top 5 | Video + written content |
| Shopping results dominate | Product / category page |
| Top results are Q&A format | FAQ page |

Classify by examining titles and descriptions of the top 5–10 organic results. If the SERP is mixed (no clear dominant format), default to "comprehensive guide" and note the mixed signal.
