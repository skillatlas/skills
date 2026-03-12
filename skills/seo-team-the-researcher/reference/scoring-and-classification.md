# Scoring, Classification & Enrichment Details

## Contents

- Search intent classification (rule-based + SERP-based)
- Funnel-stage mapping
- Trend detection
- Zero-click risk flagging
- Opportunity score formula (full)
- Personal Keyword Difficulty (PKD)
- Tier assignment criteria

---

## Search Intent Classification

### Rule-Based (apply first)

| Pattern | Intent |
|---------|--------|
| Questions: "how to", "what is", "why does", "when should" | Informational |
| Comparisons: "vs", "alternative", "comparison", "review" | Commercial investigation |
| Purchase signals: "buy", "price", "cheap", "discount", "deal", "coupon", "order" | Transactional |
| Brand or product names | Navigational |
| Modifiers: "best", "top", "recommended" | Commercial investigation |
| Generic terms without modifiers | Informational (default) |

### SERP-Based Verification (for ambiguous cases)

If intent is unclear from keyword text, check what Google actually ranks. Use cached SERP data from Stage 2 where available. For remaining ambiguous keywords (limit to 10–20 max):

```bash
seocli serp google organic live \
  --keyword "ambiguous keyword" \
  --location-code 2840 \
  --language-code en \
  --depth 10 \
  --device desktop
```

Classify by SERP content:

| SERP Dominated By | Intent |
|-------------------|--------|
| Blog posts, guides, tutorials | Informational |
| Comparison articles, review roundups | Commercial investigation |
| Product pages, pricing, shopping results | Transactional |
| Brand homepages | Navigational |

**The SERP always wins.** If a keyword sounds informational but the SERP is full of product pages, classify as transactional/commercial.

---

## Funnel-Stage Mapping

| Intent | Funnel Stage | Description |
|--------|-------------|-------------|
| Informational | ToFu (Top of Funnel) | Awareness, education, foundational knowledge |
| Commercial investigation | MoFu (Middle of Funnel) | Comparing, evaluating options |
| Transactional | BoFu (Bottom of Funnel) | Ready to buy, subscribe, or act |
| Navigational | navigational | Brand/product search — no funnel stage |

---

## Trend Detection

From the `monthly_searches` array returned by the search-volume endpoint (12 months of data):

### Basic Direction

1. Calculate average of last 3 months
2. Calculate average of previous 3 months (months 4–6)
3. Compare:
   - > 20% increase → **rising**
   - > 20% decrease → **declining**
   - Otherwise → **stable**

### Seasonality Detection

Check if a repeating pattern exists across the 12-month window. If a keyword's volume spikes 2× or more in specific months (e.g., "christmas home brew kit" spikes Nov–Dec), flag as **seasonal** with peak month(s).

### Deep Trend Analysis (optional)

Only run if user specifically requests trend data beyond basic direction:

```bash
seocli keywords-data dataforseo-trends explore \
  --keywords "keyword1" \
  --keywords "keyword2" \
  --location-code 2840 \
  --time-range past_12_months
```

API cost: 1 call. Not part of the default pipeline.

---

## Zero-Click Risk Flagging

Keywords where AI Overviews or featured snippets fully answer the query deliver fewer actual clicks than their raw volume suggests.

### Detection

From SERP data collected in Stage 2 (Method 3) or Stage 4:

1. Check if an AI Overview is present for the keyword
2. Assess whether the AI Overview fully answers the user's likely query
3. Check if a featured snippet provides a complete answer

### Impact

- Flag keyword as `zero_click_risk: true`
- In opportunity scoring (Stage 5), apply a **0.5× multiplier** to volume
- Example: a keyword with 10K volume and zero-click risk is scored as 5K effective volume

### Nuance

A keyword with zero-click risk is not worthless — it may still drive brand awareness and topical authority. But its traffic potential is genuinely lower, and the opportunity score should reflect that.

---

## Opportunity Score Formula

```
Opportunity = (total_cluster_volume × intent_weight × zero_click_adj) / (avg_difficulty × pkd_ratio) × relevance_score
```

### Component Definitions

**Intent weights:**

| Intent | Weight | Rationale |
|--------|--------|-----------|
| Informational | 1.0 | Drives traffic, builds authority, lower conversion |
| Commercial investigation | 2.0 | High-intent research, closer to conversion |
| Transactional | 3.0 | Highest conversion potential |
| Navigational | 0.5 | Low opportunity — user seeking a specific brand |

**Zero-click adjustment:**

| Condition | Value |
|-----------|-------|
| Cluster has zero-click risk (AI Overview fully answers) | 0.5 |
| No zero-click risk | 1.0 |

**Relevance score:**

Default 1.0. After presenting initial clusters, ask the user if they have priority topics. If "we really care about IPA recipes" → set relevance_score = 2.0 for IPA clusters.

---

## Personal Keyword Difficulty (PKD)

Standard KD assumes an average domain. PKD adjusts for the user's actual domain strength.

### Formula

```
PKD = raw_KD × (user_domain_rank / avg_domain_rank_of_top_10)
```

### Example

- User domain rank: 40
- Average DR of top 10 results: 65
- Raw KD: 45
- PKD = 45 × (40 / 65) = 27.7

A DR-40 site faces effectively lower difficulty than the raw metric suggests for this keyword.

### Data Sources

- User domain rank: from `workspace/seo/audit-history/` (backlinks bulk-ranks data) or `seocli backlinks bulk-ranks --targets "example.com"`
- Top 10 DR: from SERP data + backlinks bulk-ranks for top-ranking domains

### Fallback

If domain authority data is not available, use raw KD with `pkd_ratio = 1.0`. Note this in the output.

In the opportunity formula, use `pkd_ratio = user_DR / avg_DR_of_top_10` (where lower ratio means easier competition). If the user's DR equals the average top-10 DR, ratio = 1.0 and PKD = raw KD.

---

## Tier Assignment

After scoring, assign each cluster to a strategic tier:

| Tier | Criteria | Timeline | Strategy |
|------|----------|----------|----------|
| **Quick Wins** | KD < 30, volume > 100/mo | Weeks | Single well-optimized piece. Minimal link building. |
| **Growth** | KD 30–60, volume > 500/mo | 1–3 months | Solid content + internal linking. May need supporting articles. |
| **Long-term Bets** | KD > 60, volume > 2,000/mo | 6+ months | Pillar content + supporting cluster + backlink investment. |
| **Low Priority** | KD > 60, volume < 500/mo | Deprioritize | Not worth investment unless strategically critical. |

When PKD is available, use PKD instead of raw KD for tier boundaries.

### Tier Override

If a cluster has high relevance_score (user priority topic) but falls into Low Priority by KD/volume criteria, keep the tier but add a note: "Low priority by metrics, but flagged as strategically important by user."
