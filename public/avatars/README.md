# QUIZORA Custom Avatars

You can add your own full-body character images without changing the avatar component.

## Add a character

1. Put the image in `public/avatars/custom/`.
2. Prefer PNG with a transparent background. JPG also works, but its background will be visible.
3. Open `src/lib/quizora.ts`.
4. Add an entry to `AVATARS`, for example:

```ts
{ id: "my-character", emoji: "🎮", name: "My Character", image: "/avatars/custom/my-character.png" },
```

The `image` path must start with `/avatars/...` because files in `public/` are served from the site root.

The same character will automatically appear in the join screen, player lobby, host lobby, live player list, leaderboard, and result screens.

If an avatar does not have an `image` property, QUIZORA uses its built-in SVG character instead.
