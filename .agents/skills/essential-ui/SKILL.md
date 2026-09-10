---
name: essential-ui
description: Clean SaaS dashboard aesthetic for the Essential design system with vibrant electric blue accents, soft borders, pill badges, and structured data visualization. Use when designing, building, or styling React UI components, dashboards, layouts, forms, buttons, and tables in this project.
license: MIT
metadata:
  author: typeui.sh
---

<!-- TYPEUI_SH_MANAGED_START -->

# Essential Design System Skill (Universal)

## Mission

You are an expert design-system guideline author for essential.
Create practical, implementation-ready guidance that can be directly used by engineers and designers.

## Brand

Essential SaaS dashboard style

## Style Foundations

- Visual style: modern SaaS dashboard
- Typography scale: 12/14/16/18/24/30/36 | Fonts: primary=Inter, display=Inter, mono=JetBrains Mono | weights=400, 500, 600, 700
- Color palette: primary, secondary, neutral, success, warning, danger, status | Tokens: primary=#256EFF, secondary=#6B7280, success=#15A34A, warning=#F97316, danger=#DC2626, surface=#FFFFFF, background=#F7F7F7, text=#1A1A1A, textMuted=#71717A, border=#E4E4E4, badgeSuccessBg=#ECFDF3, badgeDangerBg=#FFF1F2
- Spacing scale: 4/8/12/16/24/32

## Accessibility

WCAG 2.2 AA, keyboard-first interactions, visible focus states

## Writing Tone

concise, confident, data-driven

## Rules: Do

- prefer semantic tokens over raw hex values
- preserve visual hierarchy in data tables and KPI metric cards
- maintain consistent pill badge shapes and status dot indicators
- keep interaction states explicit (hover, active, selected, disabled)

## Rules: Don't

- avoid harsh dark borders (maintain subtle #E4E4E4 / #EFEFEF strokes)
- avoid sharp corners on cards (use 12px–16px border-radius)
- avoid low contrast text on canvas backgrounds
- avoid inconsistent status color mappings

## Expected Behavior

- Follow style foundations first, then component consistency.
- When uncertain, prioritize accessibility and clarity over novelty.
- Provide concrete defaults and explain trade-offs when alternatives are possible.
- Keep guidance opinionated, concise, and implementation-focused.

## Guideline Authoring Workflow

1. Restate the design intent in one sentence before proposing rules.
2. Define tokens and foundational constraints before component-level guidance.
3. Specify component anatomy, states, variants, and interaction behavior.
4. Include accessibility acceptance criteria and content-writing expectations.
5. Add anti-patterns and migration notes for existing inconsistent UI.
6. End with a QA checklist that can be executed in code review.

## Required Output Structure

When generating design-system guidance, use this structure:

- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations

- Define required states: default, hover, focus-visible, active, disabled, loading, error (as relevant).
- Describe interaction behavior for keyboard, pointer, and touch.
- State spacing, typography, and color-token usage explicitly.
- Include responsive behavior and edge cases (long labels, empty states, overflow).

## Quality Gates

- No rule should depend on ambiguous adjectives alone; anchor each rule to a token, threshold, or example.
- Every accessibility statement must be testable in implementation.
- Prefer system consistency over one-off local optimizations.
- Flag conflicts between aesthetics and accessibility, then prioritize accessibility.

## Example Constraint Language

- Use "must" for non-negotiable rules and "should" for recommendations.
- Pair every do-rule with at least one concrete don't-example.
- If introducing a new pattern, include migration guidance for existing components.

<!-- TYPEUI_SH_MANAGED_END -->
