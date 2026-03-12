---
name: writing-ux-copy
title: UX Copywriting
description: Use when writing or reviewing interface text including buttons, labels, error messages, empty states, notifications, or any user-facing microcopy.
license: MIT
metadata:
  author: Skillatlas
  version: "0.1.0"
  homepage: https://skillatlas.sh/
---

Treat `<good-example>` as patterns to follow; `<bad-example>` as patterns to avoid.

---

## 1. Goals

Optimize for:

1. **Clarity** — user instantly understands what will happen
2. **Completion** — user finishes without help
3. **Confidence** — user feels safe and in control
4. **Character** — human and on-brand, without hurting 1–3

Microcopy motivates **before** the click, guides **during**, confirms **after**.

---

## 2. Workflow

1. **Decide the one thing**: Each piece of copy has one job—explain, reassure, instruct, or encourage. Cut everything else.

2. **Draft, then cut**: Write naturally, then remove filler. One idea per sentence.

3. **Check for friction**: Does this answer the user's likely question here? Could we fix the UX instead of adding words?

---

## 3. Voice & Tone

- Talk to one person. Use "you" and "we."
- Be honest. No dark patterns, no fake urgency.
- Match emotion to moment: calm in errors, upbeat in success, neutral in setup.
- Humor only where stakes are low. Never joke about money, health, identity, or access.

<good-example>
title: "We couldn't process your payment"  
body: "Check your card details or try another method."
</good-example>

<bad-example>
title: "Payment processing error (code 3241)"  
body: "An unexpected error has occurred."
</bad-example>

---

## 4. Patterns by Element

### Buttons & CTAs

Button text = **action + outcome**. Describe what happens, not the system action.

<good-example>
"Create free account" · "Send feedback" · "Download invoice"
</good-example>

<bad-example>
"Submit" · "Proceed"
</bad-example>

**Click triggers** (text near buttons) tip the scale:

<good-example>
button: "Start free trial"  
trigger: "No credit card required"
</good-example>

When buttons appear together, make primary vs secondary obvious:

<good-example>
primary: "Save changes"  
secondary: "Discard"
</good-example>

---

### Forms

- Labels stand alone; don't rely on placeholders.
- Use examples for format, not long explanations.
- Explain why you need sensitive info.

<good-example>
label: "Phone"  
help_text: "We'll only text for delivery issues."
</good-example>

<bad-example>
placeholder: "Enter a strong password with upper and lower case letters, numbers, and at least one special character"
</bad-example>

---

### Errors

Say what went wrong **and** how to fix it. Use calm tone; take blame when it's the system's fault.

<good-example>
"Phone number should be 10 digits"
</good-example>

<bad-example>
"Invalid phone number"
</bad-example>

<good-example>
"We couldn't send that. Check your connection and try again."
</good-example>

<bad-example>
"Form submission failed"
</bad-example>

Avoid internal codes unless needed for support.

---

### Success States

Confirm _what_ succeeded. Tell users what happens next.

<good-example>
title: "Payment received"  
body: "We've emailed your receipt to alex@example.com."
</good-example>

Avoid empty "Success!" messages with no detail.

---

### Empty States

Include: (1) what this space is for, (2) why it's empty, (3) one clear next step.

<good-example>
title: "No projects yet"  
body: "Create your first project to track tasks and deadlines."  
button: "Create project"
</good-example>

<good-example>
"Heart items to save them here for later."
</good-example>

---

### Loading & Progress

Set expectations. Suggest safe parallel actions when possible.

<good-example>
"This may take up to 2 minutes. We're processing your video in HD."
</good-example>

<good-example>
"Syncing your files… You can keep working while we finish."
</good-example>

---

### 404s & System Errors

Acknowledge the problem, take responsibility, offer paths forward.

<good-example>
title: "We can't find that page"  
body: "It might have been moved or deleted."  
links: "Go to homepage" · "Search" · "Contact support"
</good-example>

---

### Permissions & Risky Actions

Say **why** you need something and what you'll do with it. Be explicit about risk and reversibility.

<good-example>
"Allow access to your camera?"  
"We'll use it to scan your ID. Photos are encrypted and stored securely."
</good-example>

<good-example>
title: "Delete this project?"  
body: "This removes all tasks and files. You can't undo this."  
buttons: "Delete project" · "Cancel"
</good-example>

---

### Sign Up & Login

**Sign up**: Welcome, don't label.

<good-example>
"Let's get started"
</good-example>

<bad-example>
"Registration form"
</bad-example>

**Login**: Acknowledge return.

<good-example>
"Welcome back"
</good-example>

**Password recovery**: Reassure.

<good-example>
"Forgot your password? No worries—we'll email you a reset link."
</good-example>

---

## 5. Quick Reference

| Instead of            | Write                           |
| --------------------- | ------------------------------- |
| "Invalid input"       | "Try a different format"        |
| "An error occurred"   | "Something went wrong"          |
| "User not found"      | "We don't recognize that email" |
| "Required field"      | "We need this to continue"      |
| "Submit"              | "Send message" / "Get started"  |
| "Please wait"         | "Working on it…"                |
| "Operation completed" | "Done!"                         |
| "Unauthorized"        | "You'll need to log in first"   |
| "Click here"          | Descriptive link text           |
