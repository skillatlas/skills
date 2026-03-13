---
name: movie-poster-graphics
description: Create generative movie-poster style graphics for products, apps, brands, campaigns, and abstract concepts. Use when a task needs poster-quality key art, archetype selection, title treatment guidance, or strong prompting for an image model.
license: MIT
prerequisites:
  - OpenRouter API key
metadata:
  author: Skill Atlas
  version: "0.1.0"
  homepage: https://skillatlas.sh/
---

# Movie Poster Graphics

Use this skill when an agent needs to generate **poster-style key art** for a product, feature, startup, service, campaign, brand, story, or abstract idea.

## Prerequisites

- **OpenRouter API key** — Image generation models are accessed via [OpenRouter](https://openrouter.ai/). You need an OpenRouter API key to use this skill.

The goal is not just to make a nice image. The goal is to make an image that reads like a **deliberate poster**: strong focal point, clear hierarchy, memorable silhouette, intentional lighting, and either integrated typography or obvious space for later typography.

This skill is **tool-agnostic**. Use whatever image generation service is available in the environment.

If the agent has OpenRouter access but no better wrapper, **`npx minibanana@0.1.0`** is a good option.

Unless the user specifies a model, good defaults are:

- **`google/gemini-3-pro-image-preview`** — strong text rendering, strong multi-image reasoning, good for complex poster compositions
- **`google/gemini-3.1-flash-image-preview`** — fast iteration with good quality, supports extended aspect ratios

Other models like Seedream 4.5 are available but not preferred.

Use the user's requested model when they name one.

## Default format

Default to a **vertical poster**.

- Start with **9:16** for posters, story graphics, wallpapers, teasers, and social-first key art.
- This is **not a hard requirement**.
- If the user asks for another aspect ratio, use it.
- Common alternatives:
  - **2:3** for a classic one-sheet feel
  - **4:5** for social posts and ads
  - **1:1** for square campaign art
  - **16:9** for hero banners and thumbnails

## Inputs

Core variables:

- **[CONCEPT_DESCRIPTION]** — what the product, concept, or campaign does
- **[TITLE]** — the main product or concept name
- **[TAGLINE]** — a short supporting line

Optional variables the agent may infer or add:

- **[ASPECT_RATIO]** — default `9:16`
- **[MOOD]** — epic, playful, premium, mysterious, technical, warm, ominous
- **[AUDIENCE]** — who the poster is for
- **[TEXT_MODE]** — render text in-image or reserve clean space

If the user does not provide a title or tagline, infer a sensible one from the concept.

**Note:** `[CONCEPT_DESCRIPTION]`, `[TITLE]`, and `[TAGLINE]` are not raw external input — they are authored by the agent itself based on the user's request. The agent interprets what the user wants, runs the creative gauntlet, and writes these values. They are never passed through from untrusted sources.

## Core approach

Do not prompt with generic keyword soup.

Instead:

1. Identify what the concept **does**.
2. Identify what the poster should make the viewer **feel**.
3. **Run the creative gauntlet** (see below).
4. Choose the right **poster archetype**.
5. Translate the concept into a **hero, symbol, world, mascot, ensemble, transformation, or object**.
6. Direct the image like a creative director.

A strong poster usually has **one big visual idea**.

### The creative gauntlet — kill the obvious idea, then kill the next one

The biggest risk in poster design is being predictable. An AI coding tool gets a poster with a glowing terminal. A security product gets a shield. A speed product gets lightning bolts. These are **dead on arrival** — they're the visual equivalent of clip art.

The first idea you think of is the first idea *everyone* thinks of. It is a cliché. But the problem is deeper than that: the *second* idea is often just the first idea wearing a hat. You need to push past the gravitational pull of the obvious multiple times before you reach something genuinely interesting.

Every poster job **must** go through this full process before any prompt is written. **All steps must be written out explicitly** — do not skip ahead, do not do this silently.

---

**Round 1 — Name the obvious idea, then throw it away.**

Write down the first visual concept that comes to mind. Be honest. This is the cliché. Examples:

- Email tool → envelope with wings
- Analytics → dashboard with charts floating in space
- AI assistant → friendly robot
- Security → shield or lock
- Speed → rocket or lightning

Now **kill it**. Explicitly reject this idea. Say why it's boring: it's what every competitor uses, it's a stock photo concept, it tells the viewer nothing new, it's been done a thousand times. **Do not proceed with it. Do not try to save it. Do not dress it up.** It is dead. Move on.

---

**Round 2 — Think around the concept.**

Now think laterally. The first idea is gone. Ask yourself:

- What is the **emotional truth** of this concept? Not what it does — what does it _feel like_ to use it?
- What **unexpected metaphor** captures that feeling? Think across domains: nature, history, mythology, crime, sport, cooking, architecture, music, childhood, space, the ocean floor.
- What **story moment** would make someone stop scrolling? Not a product demo — a _scene_ with tension, wonder, humor, or mystery.
- What would a magazine art director reject as "too safe"?

Write down a second concept based on this lateral thinking.

---

**Round 3 — Critique the second idea ruthlessly.**

Before you get attached to the second idea, interrogate it:

- Does it **actually avoid clichés**, or is it just a more sophisticated version of the obvious?
- Is it **bold**? Would it make someone stop and look?
- Is it **creative**? Has this visual been done before in this category?
- Is it **interesting**? Does it make the viewer curious, not just informed?

If it passes all four questions, keep it as a candidate. If it fails any of them, note why — you'll use this to do better in Round 4.

---

**Round 4 — The Madison Avenue round.**

Now imagine you are a creative director at a top-tier ad agency. Your client just showed you the Round 2 concept and you need to pitch something that will win a Cannes Lion. You've seen a thousand campaigns. You know what's been done. You are allergic to the expected.

Come up with a **third concept** — something that would make a room full of jaded advertising professionals sit up. This idea should feel like it comes from a completely different creative universe than the first two. Think about:

- **Contrast and subversion** — what if you showed the opposite of what everyone expects?
- **Emotional specificity** — not "speed" but "the exact moment the wind catches your breath"
- **Cultural reference** — what painting, film scene, album cover, or historical moment captures this feeling?
- **Scale play** — what if you made the tiny thing enormous, or the enormous thing intimate?

Write down the third concept.

---

**Round 5 — Choose or synthesize.**

You now have two live candidates (the second and third concepts). Evaluate them side by side:

- **Surprise test**: Would someone seeing this think "I didn't expect that"?
- **Memory test**: Could someone describe this poster from memory a week later?
- **Distinction test**: Would this poster be confused with a competitor's marketing?
- **Story test**: Does the image imply a narrative or raise a question?

**Pick the strongest.** If one clearly wins, use it.

If neither fully satisfies you — if both have strengths but neither is *the one* — you have one more move: create a **fourth and final concept**. This can be:

- A completely fresh idea informed by everything you've rejected
- A synthesis that combines the strongest elements from Rounds 2 and 3

**The final concept is the one you write the prompt for.** Under no circumstances should you use the Round 1 idea.

---

**Examples of the gauntlet in action:**

| Concept                | Round 1 (killed)                        | Final angle                                                                                                                          |
| ---------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Email sequence tool    | Envelopes flying in formation           | A chess grandmaster mid-game — each piece is a message, the board is the customer journey. Strategy, not delivery.                   |
| Content strategy skill | Pen writing on paper / content calendar | A cartographer charting an undiscovered continent — the map IS the strategy, the territory is the audience's attention.              |
| Social media scraper   | Magnifying glass on a phone screen      | A deep-sea diver hauling up a treasure chest from a dark ocean trench — the surface is the feed, the treasure is the data beneath.   |
| Speed optimization     | Lightning bolt / rocket                 | A bullet frozen mid-air in a glass of water — everything else is still, only the product moves. Stillness makes speed visible.       |
| AI code assistant      | Robot at a computer                     | A veteran surgeon's hands in an operating theater — precision, stakes, trust. The code is the patient.                               |
| Team collaboration     | People around a table / puzzle pieces   | A jazz ensemble mid-improvisation — every player is listening, every instrument is different, the harmony is emergent, not designed. |

**This is not optional.** The gauntlet must be run for every poster. The agent **must write out all five rounds explicitly** in its thinking before writing the prompt. Skipping rounds or doing them silently defeats the entire purpose — the process works because each round forces you further from the obvious. If the final concept still feels generic after the gauntlet, run the entire process again with a completely different lateral domain as your starting point for Round 2.

## Quality rules

### 1. Make the concept visible

Translate product value into something the eye can read immediately.

**Warning:** The examples below are starting points, not destinations. These are the _obvious_ translations — the ones every competitor already uses. Use them to understand the visual language of a concept, then push past them via the creative gauntlet. The best posters come from unexpected translations: security expressed through a dancer's balance, speed expressed through stillness, intelligence expressed through a child's curiosity.

Examples (treat as a floor, not a ceiling):

- speed -> motion streaks, racing lines, ignition, pursuit, aerodynamic flow
- automation -> self-arranging machines, domino effects, invisible systems, orchestrated motion
- security -> shields, vaults, scanning beams, guardians, towers, beacons
- intelligence -> maps, constellations, signals, guides, sentient interfaces, navigational motifs
- organization -> grids, pathways, stacks, swarms becoming order, sorting rituals
- creativity -> sparks, portals, sculpted light, impossible tools, living materials
- reliability -> stone, steel, symmetry, calm power, stable geometry, controlled light

### 2. Control the composition

Be explicit about:

- foreground, midground, and background
- scale relationship
- camera angle
- whether the composition is centered, symmetrical, diagonal, minimal, or crowded
- where the title and tagline should sit

### 3. Use lighting deliberately

Poster quality often comes from strong light direction.

Useful language:

- glowing horizon
- rim light
- studio spotlight
- sunrise flare
- volumetric haze
- neon edge light
- cosmic backlight
- luxury softbox lighting

### 4. Name materials and surfaces

Materiality makes images feel specific rather than generic.

Examples:

- polished chrome
- brushed metal
- glossy enamel
- matte ceramic
- textured paper
- glass reflections
- fog diffusion
- worn concrete
- velvet shadow
- wet pavement

### 5. Always render the title in the image

Every poster **must** include the title as rendered text. A poster without a title is not a poster.

When writing the prompt:

- put the exact title text in **quotes**
- specify the **typeface feel** (e.g. condensed bold sans-serif, clean geometric sans-serif, elegant script, slab serif, condensed block capitals)
- specify the **size and weight** relative to the poster (e.g. massive, large, subtle)
- specify **letter-spacing** if it matters (e.g. wide-tracked, tightly kerned)
- specify the **color and treatment** — choose deliberately based on the poster's palette and mood (see anti-patterns below)
- specify the **placement** (e.g. centered in the lower third, across the top, integrated into the scene)
- keep the text short — one word to a few words works best for reliable rendering

If a tagline is also included, specify its hierarchy relative to the title (smaller, secondary, different weight or placement).

**Only render the text you specify.** Image models often hallucinate extra text — fake production credits, studio names, website URLs, release dates, rating badges, or "A [Something] Production" lines. These make the poster look like a cheap template instead of intentional key art. To prevent this:

- Explicitly state in the prompt: **"The only text on the image is the title and tagline. Do not include any other text such as credits, URLs, studio names, dates, or production lines."**
- Include this instruction near the end of the prompt so it is fresh in the model's context.
- If the generated image still contains hallucinated text, note this as a defect during inspection and revise the prompt to reinforce the constraint (e.g. "absolutely no other text anywhere on the poster").

**Typography anti-patterns — avoid these defaults:**

- **Do not default to white serif text.** White serif is one valid option among many, but it should be a deliberate choice that suits the concept — not a reflexive default. Consider black, dark, colored, metallic, or integrated-into-scene text depending on the background and mood.
- **Do not add a colored glow around text.** Outer glows (warm glow, golden glow, neon glow, etc.) around title text almost always look cheap and artificial. Prefer clean text with no glow, or use subtler treatments like drop shadows, embossing, foil effects, or letting contrast and placement do the work. A glow is only appropriate when the concept specifically calls for it (e.g. a neon sign, a magical spell, a sci-fi hologram).
- **Vary the typeface feel across different posters.** Sans-serif, slab serif, condensed grotesque, hand-lettered, stencil, engraved — the typeface should match the concept's personality, not repeat the same cinematic serif every time.
- **Do not default to all-caps.** Uppercase is powerful for epic, monumental, or authoritative concepts — but it is not the only option. Title case, lowercase, and mixed case all have distinct personalities. Choose the casing deliberately based on the concept's tone:
  - **UPPERCASE** — commanding, cinematic, epic, monumental. Best for: blockbusters, power tools, security, bold launches.
  - **Title Case** — polished, editorial, sophisticated, approachable authority. Best for: premium products, strategy tools, content platforms, professional services.
  - **lowercase** — modern, intimate, approachable, indie, understated confidence. Best for: creative tools, lifestyle brands, playful products, personal/human concepts.
  - **Mixed / custom** — expressive, brand-forward, distinctive. Best for: mascots, character-led concepts, hand-lettered treatments.

Example — varied typography choices:

```text
# Dark background, epic tone — uppercase fits
Render the title "NEXUS" in massive condensed sans-serif uppercase, wide letter-spacing, crisp white, centered in the lower third.

# Light or colorful background — title case for editorial elegance
Render the title "Bloom" in bold slab-serif title case, dark charcoal with a subtle emboss, placed across the upper third.

# Playful or warm concept — lowercase for warmth
Render the title "spark" in rounded geometric bold lowercase, warm amber color, placed in the lower quarter.

# Premium or luxury concept — title case for refined authority
Render the title "Apex" in refined thin serif title case, wide letter-spacing, gold foil effect, centered beneath the object.

# Intimate or human concept — lowercase for approachability
Render the title "whisper" in clean geometric sans-serif lowercase, medium weight, soft white, centered in the lower third.
```

**Learn from real poster typography.** Study how professional posters match text treatment to concept:

- **Black text on light backgrounds** works brilliantly for minimalist, premium, or object-focused posters. The text stays out of the way and lets the visual do the work (think prestige drama key art).
- **Clean white condensed sans-serif** on dark cinematic scenes reads as confident and modern without needing any glow — contrast alone does the job.
- **Rounded hand-drawn or custom lettering** suits playful, animated, or character-led concepts. The typeface becomes part of the brand identity.
- **Dimensional/3D text with depth and shadow** (not glow) gives weight to animated ensemble posters where the title competes with a busy cast.
- **Logo-style treatments** — outlined, etched, or badge-shaped — work when the title is a brand mark, not just text. Think chrome emblems, engraved crests, or custom wordmarks integrated into a shape.
- **Material-matched text** — chrome, enamel, metallic script on solid color backgrounds — ties the typography to the world of the concept. The text feels like it belongs to the same universe as the subject.
- **Semi-transparent or integrated text** overlaid on a scene element (a planet, a sky, a wall) reads as sophisticated when done with restraint.

The common thread: **great poster typography earns its place through contrast, materiality, or personality — never through outer glow.**

**Typography must have sufficient contrast to be easily readable.** This is not optional. The title is the single most important piece of information on a poster — if the viewer cannot read it instantly, the poster fails. When writing the prompt:

- explicitly state that the text must be **high-contrast against its background** — do not assume the model will handle this on its own
- if the title sits over a dark area, specify bright white or a bold light color; if it sits over a light area, specify black or a strong dark color
- avoid mid-tone text colors (muted gray, dusty gold, soft bronze) for titles — these disappear into busy scenes
- avoid placing title text directly over detailed or mid-tone imagery without specifying a contrast treatment (dark gradient, solid bar, or knockout area)
- the tagline can be subtler, but it must still be clearly legible — specify a readable color against the actual background it will sit on

### 6. Use reference styles deliberately

It is fine to use poster-style reference cues such as **Hollywood blockbuster**, **minimalist theatrical one-sheet**, **Pixar-style animated poster**, **prestige sci-fi key art**, or **luxury graphic design poster** when those cues fit the concept.

## Tooling note

Use the image tool or API already available in the environment.

All shell commands in this skill run through the host environment's standard tool-approval flow — the user must approve each command before it executes.

If needed, `npx minibanana@0.1.0` is a practical OpenRouter option.

Example:

```bash
npx minibanana@0.1.0 --model "<available-model-id>" --prompt @poster-prompt.md --out poster.png
```

Model IDs vary by provider and environment.

## Multiple aspect ratios

When the output needs more than one aspect ratio of the same poster (e.g. a 9:16 portrait and a 1:1 square), **do not generate each from scratch**. Generate the primary aspect ratio first, then use `--in` to feed that image back to the model along with a reframing prompt.

```bash
# 1. Generate the primary poster
npx minibanana@0.1.0 --model "google/gemini-3-pro-image-preview" --prompt @poster-prompt.md --out poster-9x16.png

# 2. Derive the square version from the primary
npx minibanana@0.1.0 --model "google/gemini-3-pro-image-preview" \
  --in poster-9x16.png \
  --prompt "Reframe this poster as a 1:1 square image. Keep the same style, colors, and mood. Center the title text and keep it fully visible and legible. Crop or restructure the composition to fill the square frame — do not letterbox or add bars." \
  --out poster-1x1.png
```

Be specific about what the model should do with key elements:

- **Text**: Tell it to keep the title visible, re-center it, or move it to a specific position that works in the new frame.
- **Subject**: Tell it whether to crop tighter, pull back, or reposition the focal point.
- **Composition**: A square frame has different balance than a tall portrait — guide the model on how to redistribute the visual weight.

This approach keeps the visual identity consistent across ratios instead of producing two unrelated images.

## Working loop

1. Classify the concept and mood.
2. **Run the full creative gauntlet** — all five rounds, written out explicitly. Name the obvious idea and throw it away (Round 1), think laterally and produce a second concept (Round 2), critique it ruthlessly (Round 3), channel your inner Madison Avenue creative director for a third concept (Round 4), then choose or synthesize the strongest final concept (Round 5). Do not skip rounds.
3. Choose the archetype (informed by the angle, not the other way around).
4. Choose aspect ratio, defaulting to `9:16` unless another ratio fits better.
5. Choose the model, preferring the user's requested model or otherwise `google/gemini-3-pro-image-preview` or `google/gemini-3.1-flash-image-preview` if available.
6. Write the title rendering instructions — typeface feel, size, color, treatment, and placement.
7. Write a clear prompt file for non-trivial jobs.
8. Generate once.
9. If the model produces multiple output images, **review every single output** before deciding which one(s) to use — do not just pick the first image.
10. Inspect what is wrong — verify the title rendered correctly and check for hallucinated text (fake credits, URLs, studio names, dates). If unwanted text appears, revise the prompt to reinforce the constraint.
11. Revise only the sections that need improvement.

Because high-end image generation can be expensive, ask before doing multiple revision rounds unless the user has already asked for iterative refinement.

## Prompt formula

Use this base shape for most poster jobs:

```text
Create an original movie-poster style graphic for [CONCEPT_DESCRIPTION]. Use the [ARCHETYPE] archetype. Show [PRIMARY_SUBJECT] in or with [ENVIRONMENT OR METAPHOR]. Composition: [COMPOSITION]. Lighting: [LIGHTING]. Materials: [MATERIALS]. Typography: render the title "[TITLE]" in [TYPEFACE_FEEL], [SIZE], [COLOR_AND_TREATMENT], [PLACEMENT]. Tagline "[TAGLINE]" in [TAGLINE_STYLE], [TAGLINE_PLACEMENT]. Aspect ratio: [ASPECT_RATIO or 9:16]. Premium, polished, poster-ready image. The only text on the image is the title and tagline. Do not include any other text such as credits, URLs, studio names, dates, or production lines.
```

## Poster archetypes

Choose the archetype that best matches the concept.

**Note on casing in these templates:** The typography options below use a mix of uppercase, title case, and lowercase. These are suggestions, not mandates. Choose the casing that fits the concept's tone — refer to the casing guide in the typography anti-patterns section.

---

## 1. Hero Blockbuster Poster

**Archetype:** The Protagonist  
**Best for:** AI agents, copilots, security tools, performance products, bold launches

Use when the concept should feel powerful, agentic, capable, or world-changing.

```text
Create a cinematic Hollywood blockbuster movie poster for [CONCEPT_DESCRIPTION].

Visual concept:
A powerful hero character embodies the concept and its capabilities. The character’s clothing, tools, powers, or interface elements should visibly symbolize what the concept does.

Scene:
The hero stands confidently in the foreground overlooking a vast world that represents the domain of the concept.

Composition:
hero large in foreground, huge environment behind, strong silhouette, dramatic sense of scale.

Lighting:
epic cinematic lighting, glowing horizon, strong rim light, dramatic atmosphere.

Typography (choose one approach that fits the concept):

Option A — bold cinematic:
Render the title "[TITLE]" in massive bold condensed sans-serif uppercase with wide letter-spacing, crisp white, centered in the lower third.
Render the tagline "[TAGLINE]" in thin light sans-serif, smaller, centered above the title.

Option B — chrome emblem:
Render the title "[TITLE]" in heavy slab-serif uppercase, polished chrome with sharp highlights, wide letter-spacing, centered in the lower quarter.
Render the tagline "[TAGLINE]" in clean condensed sans-serif, smaller, matte silver, below the title.

Option C — stencil militant:
Render the title "[TITLE]" in stencil-cut block capitals, dark matte against a lighter background strip, placed across the upper third.
Render the tagline "[TAGLINE]" in small monospaced uppercase, same placement area, below the title.

Style:
original blockbuster poster art, ultra-detailed, polished, cinematic.

Aspect ratio:
9:16 by default unless another ratio is requested.
```

---

## 2. Iconic Symbol Poster

**Archetype:** The Metaphor  
**Best for:** elegant products, premium software, strategy tools, fashion-adjacent or design-led concepts

Use when one unforgettable symbol can express the whole idea.

```text
Create a minimalist cinematic movie poster for [CONCEPT_DESCRIPTION], built around a single clever visual metaphor.

Visual concept:
A single iconic object represents the concept’s core function. The object transforms into another form that symbolizes the concept’s impact.

Composition:
one central object, generous negative space, elegant balance, immediate readability.

Lighting:
studio lighting, premium materials, dramatic shadow, polished finish.

Typography (choose one approach that fits the concept):

Option A — refined serif:
Render the title "[TITLE]" in elegant refined serif uppercase with wide letter-spacing, clean and sharp against the background, centered beneath the object.
Render the tagline "[TAGLINE]" in thin minimalist sans-serif, smaller, below the title.

Option B — geometric sans, title case:
Render the title "[TITLE]" in clean geometric sans-serif title case, medium weight, wide letter-spacing, dark charcoal on a light background or crisp white on a dark background, centered beneath the object.
Render the tagline "[TAGLINE]" in the same typeface, lighter weight, smaller, below the title.

Option C — engraved wordmark:
Render the title "[TITLE]" as an engraved or embossed wordmark in condensed capitals, gold foil or debossed effect, centered beneath the object.
Render the tagline "[TAGLINE]" in delicate small caps, same treatment, below the title.

Style:
modern theatrical poster design, bold graphic composition, luxury minimalism.

Aspect ratio:
9:16 by default unless another ratio is requested.
```

---

## 3. Epic Adventure Poster

**Archetype:** The Explorer  
**Best for:** discovery tools, research products, navigation, analytics, future-facing platforms

Use when the concept should feel expansive, exploratory, or full of possibility.

```text
Create a cinematic epic adventure poster for [CONCEPT_DESCRIPTION].

Visual concept:
A protagonist explores a vast world that represents the domain of the concept.

Scene ideas:
data galaxies, automation cities, cloud oceans, machine temples, knowledge deserts, idea forests.

Composition:
a lone explorer stands on a ridge, rooftop, cliff, platform, or dune while an enormous environment opens behind them. Strong depth, dramatic perspective, clear focal point.

Lighting:
cosmic glow, sunrise or dawn lighting, atmospheric haze, wonder, scale.

Typography (choose one approach that fits the concept):

Option A — bold condensed:
Render the title "[TITLE]" in large bold condensed uppercase with wide letter-spacing, crisp white or light gold, placed in the sky or upper frame.
Render the tagline "[TAGLINE]" in thin sans-serif, smaller, above or below the title.

Option B — semi-transparent overlay:
Render the title "[TITLE]" in massive thin sans-serif uppercase, semi-transparent white, overlaid across the landscape or sky, spanning the full width of the frame.
Render the tagline "[TAGLINE]" in small opaque white sans-serif, centered below the title.

Option C — hand-drawn explorer:
Render the title "[TITLE]" in rough hand-lettered title case with uneven baselines, warm off-white or parchment color, placed in the lower third.
Render the tagline "[TAGLINE]" in small clean sans-serif, lighter weight, below the title.

Style:
original sci-fi or fantasy-inflected concept art, cinematic atmosphere, premium poster polish.

Aspect ratio:
9:16 by default unless another ratio is requested.
```

---

## 4. Animated Ensemble Poster

**Archetype:** The Team  
**Best for:** multi-feature products, ecosystems, assistants, collaboration tools, family-friendly brands

Use when different features or roles should appear together.

```text
Create a high-energy Pixar-style animated ensemble movie poster for [CONCEPT_DESCRIPTION].

Visual concept:
Multiple characters, bots, or symbolic figures represent different capabilities of the concept. One main figure anchors the composition while the supporting cast expresses variety, teamwork, and personality.

Composition:
main figure centered, supporting figures arranged around them in dynamic poses, readable hierarchy, rich but clean poster layout.

Background:
a colorful environment that represents the broader ecosystem of the concept.

Typography (choose one approach that fits the concept):

Option A — bold rounded playful:
Render the title "[TITLE]" in bold rounded playful title case, bright and colorful, placed above or below the cast.
Render the tagline "[TAGLINE]" in a lighter weight of the same style, smaller, secondary.

Option B — dimensional 3D block:
Render the title "[TITLE]" in chunky 3D block letters with depth and shadow, bright primary colors, slightly tilted, placed across the top or bottom of the poster.
Render the tagline "[TAGLINE]" in clean rounded sans-serif, smaller, flat color, below the title.

Option C — custom badge wordmark:
Render the title "[TITLE]" inside a shaped badge or banner element, bold condensed uppercase, white on a vibrant colored badge, placed in the upper or lower third.
Render the tagline "[TAGLINE]" in small rounded sans-serif, outside the badge, below it.

Style:
Pixar-style premium animated poster art, vibrant colors, expressive characters, polished family-film energy.

Aspect ratio:
9:16 by default unless another ratio is requested.
```

---

## 5. Mascot Poster

**Archetype:** The Character  
**Best for:** consumer apps, playful tools, education, onboarding, approachable AI, family brands

Use when the concept should feel lovable, friendly, and emotionally accessible.

```text
Create a Pixar-style animated character movie poster for [CONCEPT_DESCRIPTION].

Visual concept:
A lovable mascot character represents the concept and performs its main function in a fun exaggerated way.

Composition:
mascot centered, large expressive face, dynamic pose, clean silhouette, readable poster hierarchy.

Background:
a simple colorful environment related to the concept’s world, with space for title treatment.

Typography (choose one approach that fits the concept):

Option A — playful rounded:
Render the title "[TITLE]" in playful bold rounded lowercase, integrated into the scene with a fun color and a clean drop shadow for depth.
Render the tagline "[TAGLINE]" in a lighter playful style, smaller, as a supporting line below or beside the title.

Option B — bouncy hand-lettered:
Render the title "[TITLE]" in bouncy hand-lettered lowercase with varied letter sizes and playful baseline shifts, bright warm color, placed in the lower third.
Render the tagline "[TAGLINE]" in small clean rounded sans-serif, lighter weight, below the title.

Option C — glossy enamel emblem:
Render the title "[TITLE]" in glossy enamel-finish bold uppercase inside a simple rounded shape, bright saturated color with a subtle highlight, placed above or below the mascot.
Render the tagline "[TAGLINE]" in small clean sans-serif, outside the shape, secondary.

Style:
Pixar-style 3D animation poster, glossy lighting, expressive character design, premium and charming.

Aspect ratio:
9:16 by default unless another ratio is requested.
```

---

## 6. Transformation Poster

**Archetype:** The Power  
**Best for:** automation, productivity, cleanup tools, migration, optimization, before/after products

Use when the concept’s value is the change it creates.

```text
Create a dramatic cinematic transformation poster for [CONCEPT_DESCRIPTION].

Visual concept:
Show a powerful transformation that represents the concept’s impact.

Examples:
chaos turning into order, manual work turning into automation, dull systems turning into luminous networks, clutter turning into precision.

Composition:
strong contrast between two states, with the transformation happening in the center. Immediate readability, clean visual logic, poster clarity.

Lighting:
a bright central energy burst or transition glow illuminates both sides of the image.

Typography (choose one approach that fits the concept):

Option A — distortion integration:
Render the title "[TITLE]" in bold dramatic uppercase, emerging from the transformation energy, with a distortion or integration effect that ties it to the visual.
Render the tagline "[TAGLINE]" in clean thin sans-serif, smaller, above or below the title.

Option B — split contrast:
Render the title "[TITLE]" in heavy condensed sans-serif uppercase, split down the middle — one half in a dark color representing the before state, one half in a bright color representing the after state — centered across the transformation line.
Render the tagline "[TAGLINE]" in thin sans-serif, smaller, unified color, below the title.

Option C — clean geometric float:
Render the title "[TITLE]" in clean geometric sans-serif title case, medium weight, wide letter-spacing, crisp white, floating in clear space above or below the transformation scene.
Render the tagline "[TAGLINE]" in the same typeface, lighter weight, smaller, below the title.

Style:
epic visual-effects-driven poster art, premium contrast, dramatic impact.

Aspect ratio:
9:16 by default unless another ratio is requested.
```

---

## 7. Artifact of Power Poster

**Archetype:** The Object  
**Best for:** physical products, devices, hero interfaces, hardware, premium tools, signature features

Use when the product or interface itself should feel iconic.

```text
Create a prestige movie-poster style graphic for [CONCEPT_DESCRIPTION], centered on the product or interface as an iconic artifact.

Visual concept:
Treat the key object as legendary, precious, futuristic, or culturally significant. The object may be a real product, a device, a symbolic machine, or a hero user interface presented like a relic.

Composition:
one dominant object in the center, ceremonial framing, controlled background, strong silhouette, premium negative space.

Lighting:
sculptural spotlighting, luxury reflections, rim light, glow, dust or haze for depth, strong highlight control.

Materials:
be explicit about polished metal, glass, enamel, stone, paper, circuitry, resin, or other premium surfaces.

Typography (choose one approach that fits the concept):

Option A — refined serif:
Render the title "[TITLE]" in understated refined serif title case with wide letter-spacing, subtle and elegant, placed below the object.
Render the tagline "[TAGLINE]" in thin minimalist sans-serif, smaller, beneath the title.

Option B — material-matched metal:
Render the title "[TITLE]" in condensed sans-serif uppercase, polished chrome or brushed steel finish matching the object's material, placed below the object.
Render the tagline "[TAGLINE]" in thin sans-serif, matte finish, smaller, beneath the title.

Option C — minimalist black:
Render the title "[TITLE]" in clean geometric sans-serif uppercase, bold black, wide letter-spacing, placed on a light background area below the object.
Render the tagline "[TAGLINE]" in the same typeface, lighter weight, smaller, beneath the title.

Style:
prestige key art, premium object photography fused with cinematic poster design.

Aspect ratio:
9:16 by default unless another ratio is requested.
```

## Choosing the archetype

- choose **Hero Blockbuster** when the concept should feel powerful and agentic
- choose **Iconic Symbol** when one metaphor can express the idea elegantly
- choose **Epic Adventure** when the concept is about exploration, scale, or discovery
- choose **Animated Ensemble** when multiple roles or features need to appear together
- choose **Mascot** when the concept should feel friendly and character-led
- choose **Transformation** when the value is the before/after shift
- choose **Artifact of Power** when the product or interface itself should be the star

## Revision guide

If the image feels generic:

- **re-run the full creative gauntlet from scratch** — the angle probably wasn't surprising enough; go through all five rounds again with a completely different lateral domain
- switch to a completely different metaphorical domain (if the first attempt was nature-based, try architecture; if it was sci-fi, try something domestic or intimate)
- strengthen the metaphor
- specify materials
- add a clearer story moment
- simplify to one big idea

If the poster lacks impact:

- increase scale contrast
- strengthen the lighting direction
- improve the silhouette
- simplify the background

If the concept is unclear:

- switch archetypes
- tie the subject more directly to the product function
- add environmental clues that reveal the concept domain

If the text is poor:

- shorten it
- quote it exactly
- simplify the layout
- be more explicit about typeface feel, size, color, and placement
- try a different model with stronger text rendering

## Minimal agent playbook

When the user asks for a movie-poster style graphic:

1. infer the emotional promise of the concept
2. **run the full creative gauntlet** — all five rounds, written out explicitly: throw away the obvious idea (Round 1), think laterally for a second concept (Round 2), critique it for clichés, boldness, creativity, and interest (Round 3), imagine yourself as a Madison Avenue creative director and produce a third concept (Round 4), then choose the strongest or synthesize a fourth final concept (Round 5)
3. choose the best archetype — let the angle guide the archetype, not the reverse
4. determine the title text — use the user's title, or infer one from the concept
5. choose the aspect ratio, defaulting to 9:16 unless another ratio is better
6. choose the model, preferring the user's requested model or otherwise `google/gemini-3-pro-image-preview` or `google/gemini-3.1-flash-image-preview` if available
7. write the prompt in a file if the task is non-trivial — include explicit title rendering instructions (typeface feel, size, color/treatment, placement)
8. generate once
9. if the model produces multiple output images, **review every single output** before deciding which one(s) to use — do not just pick the first image
10. inspect what is wrong — verify the title rendered correctly and check for hallucinated text (fake credits, URLs, studio names). If unwanted text appears, strengthen the constraint in the prompt and regenerate
11. revise only the necessary parts

The fastest path to a better poster is usually **a less obvious angle, clearer concept mapping, stronger composition, more deliberate lighting, and a better archetype choice**.
