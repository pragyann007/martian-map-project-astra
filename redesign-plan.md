
# MARTIAN MAP — Landing Page Refinement

We need to refine the existing landing page. Do not rebuild the application or modify unrelated components.

The current issues are:
1. Sections are cluttered with too many visual elements.
2. Scrolling does not produce the intended stacked sticky-section experience.
3. The hero typography should say MARTIAN MAP instead of MARS.
4. The hero typography should follow a curved arc around the Mars planet.
5. The 3D Mars planet rotates too slowly.

## 1. Global visual direction

Maintain the established design identity:

- Background: #090A0C
- Primary text: #E8E5DF
- Accent: #C66B3D
- Secondary text: #777C83
- Font: Space Grotesk throughout.

The design must remain minimal, cinematic and editorial.

Remove unnecessary floating panels, metadata boxes, decorative borders, excessive orbital graphics and redundant text.

Every section should communicate one primary idea.

## 2. Stacked sticky scrolling

Implement a full-screen stacked section experience.

Required sections:

1. Hero
2. Project Briefing
3. Jezero Exploration
4. Exploration Capabilities
5. Final Exploration CTA

Expected behavior:

- Each section occupies approximately one viewport.
- The Hero remains pinned while Project Briefing scrolls upward over it.
- Project Briefing becomes the pinned section once it reaches the top.
- Jezero Exploration then slides over Project Briefing.
- The behavior continues for every subsequent section.
- Each new section must cover the previous section cleanly.

Use native CSS `position: sticky` and increasing z-index values for the section stack.

Do not use GSAP ScrollTrigger pinning on sections that are already using CSS sticky positioning.

GSAP may be used for subtle internal content animations.

Ensure that no ancestor creates an unintended sticky scroll container through overflow properties.

On mobile, preserve usability and prevent content clipping. Use natural scrolling where viewport constraints make stacked panels impractical.

## 3. Hero typography

Change the hero headline from MARS to:

MARTIAN MAP

The typography should follow a smooth circular arc around the upper region of the Mars sphere.

Implementation:
- Use SVG textPath.
- Use Space Grotesk.
- Uppercase text.
- Carefully adjusted letter spacing.
- Warm white color.
- Responsive positioning and sizing.

The planet should overlap the typography.

Remove the existing giant ghosted MARS lettering.

Do not add additional competing text.

## 4. Three.js Mars rotation

Increase the rotation speed of the existing Mars model.

Use delta-time-based rotation in React Three Fiber.

Start with approximately 0.18 radians per second for axial rotation, and adjust after visual inspection.

Preserve:
- Realistic Mars texture.
- Natural surface lighting.
- Subtle atmosphere.
- Existing pointer interaction.
- Responsive rendering.

Do not rotate the entire camera or scene continuously.

## 5. Simplify individual sections

**Hero**
- Curved MARTIAN MAP typography.
- Large realistic 3D Mars.
- One concise description.
- One primary exploration CTA.
- Minimal navigation.

**Project Briefing**
- One strong headline.
- One concise description of the problem ASTRA addresses.
- One supporting visual.
- No collection of floating information cards.

**Jezero Exploration**
- One prominent Jezero visual.
- Concise geological and mission context.
- Clear geographical focus.

**Exploration Capabilities**
- Present the core platform capabilities in a simple editorial arrangement.
- Avoid generic card grids.
- Use concise labels and supporting descriptions.

**Final CTA**
- Strong closing headline.
- One exploration action.
- Minimal composition.

## 6. Animation discipline

- Keep section transitions smooth.
- Use limited entrance animations for headings and visuals.
- Keep the Mars rotation continuous.
- Avoid excessive parallax.
- Avoid multiple competing animations.
- Respect prefers-reduced-motion.

## 7. Implementation constraints

Before modifying anything:

1. Inspect the existing landing-page components.
2. Inspect the current sticky and scrolling implementation.
3. Identify the source of the clutter.
4. Inspect the existing React Three Fiber Mars rotation code.
5. Preserve existing component boundaries.

Do not modify:
- The OpenLayers visualizer.
- The mission planner.
- Shared application routing unless necessary.

## 8. Final quality requirements

Test the result at desktop and mobile sizes.

Verify:
- Each section pins and is covered by the next section as intended.
- No section overlaps incorrectly.
- No sticky elements get trapped in an unintended scroll container.
- MARTIAN MAP follows a smooth arc.
- The Mars sphere rotates visibly.
- No section feels overcrowded.
- Text remains legible.
- The visual hierarchy is consistent throughout.

The objective is a cohesive cinematic exploration experience, not a collection of independent dashboard sections.