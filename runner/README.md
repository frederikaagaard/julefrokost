# Game of Fate — runner

Standalone mobile runner. Tap the left/right thirds to switch between three lanes; tap the middle to jump. Canvas perspective track, eight emoji temptations, one point per passed obstacle, K.O. and restart. From 10 points, staggered two-obstacle groups leave a safe corridor; consecutive safe lanes are at most one lane apart. Personal record stays in localStorage when supported. Arrow Left/Right changes lanes; Space or Up jumps. Leaving the tab pauses play.

No dependencies or backend. Run `npm test` for deterministic physics and collision tests; serve `dist/` as a static website. This is separate from the profile website and countdown.
