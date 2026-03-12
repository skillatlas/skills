# Schema Markup Templates (JSON-LD)

## Contents

- Article schema (always include)
- FAQ schema (when FAQ section exists)
- HowTo schema (for how-to content)
- Product/Review schema (for product pages)
- Open Graph and Twitter Card tags

---

## Article Schema (Always Include)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Title — under 110 chars]",
  "description": "[Meta description]",
  "author": {
    "@type": "Person",
    "name": "[Author name]"
  },
  "datePublished": "[YYYY-MM-DD]",
  "dateModified": "[YYYY-MM-DD]",
  "publisher": {
    "@type": "Organization",
    "name": "[Publisher name]"
  },
  "keywords": "[primary, secondary, keywords]",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "[Canonical URL]"
  }
}
```

---

## FAQ Schema (When FAQ Section Exists)

Add alongside Article schema when the content includes a Q&A section.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question text — exact question as written in H2/H3]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer text — concise, one paragraph, no HTML needed]"
      }
    },
    {
      "@type": "Question",
      "name": "[Second question]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Second answer]"
      }
    }
  ]
}
```

Each question-answer pair must match the actual content on the page.

---

## HowTo Schema (For How-To Content)

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "[Title of the how-to]",
  "description": "[Brief description of what the how-to achieves]",
  "totalTime": "[PT duration — e.g., PT30M for 30 minutes, if known]",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "[Step title]",
      "text": "[Step description — one paragraph]"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "[Step title]",
      "text": "[Step description]"
    }
  ]
}
```

Steps must match the actual numbered steps in the content.

---

## Product/Review Schema (For Product Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "[Product name]",
  "description": "[Product description]",
  "review": {
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "[1-5]",
      "bestRating": "5"
    },
    "author": {
      "@type": "Person",
      "name": "[Reviewer name]"
    }
  }
}
```

Only use when the content genuinely reviews or rates a product.

---

## Open Graph Tags

```html
<meta property="og:title" content="[Title — same as title tag or slight variation]">
<meta property="og:description" content="[Description — same as meta description or tailored for social]">
<meta property="og:image" content="[Image URL — 1200x630px recommended]">
<meta property="og:type" content="article">
<meta property="og:url" content="[Canonical URL]">
<meta property="og:site_name" content="[Site name]">
```

---

## Twitter Card Tags

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[Title]">
<meta name="twitter:description" content="[Description]">
<meta name="twitter:image" content="[Image URL]">
```

---

## Validation Notes

- JSON-LD must be valid JSON (no trailing commas, proper quoting)
- Test with Google's Rich Results Test before publishing
- `headline` in Article schema must be under 110 characters
- `dateModified` should be updated whenever content is refreshed
- FAQ schema questions must exactly match the questions on the page
- HowTo step count must match the actual steps in the content
