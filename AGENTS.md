# AGENTS.md

Tracks how much each family member has paid towards a shared Spotify plan. It is a React app built with Vite and published on GitHub Pages.

## Layout

- `src/DB.js`: all the data, with Spotify prices over time (`spotifyCosts`) and members with their payments (`familyMembers`).
- `src/App.jsx`: the UI and the debit calculations.
- `src/App.test.jsx`: tests, run with Vitest.

## Commands

```sh
npm ci            # install dependencies
npm start         # dev server
npm run lint      # ESLint
npx vitest run    # tests, single run (`npm test` stays in watch mode locally)
npm run build     # production build, written to build/
```

## Recording a payment

Most changes to this repo are payments. Follow [.claude/skills/add-payment/SKILL.md](.claude/skills/add-payment/SKILL.md), also if your tool doesn't load skills automatically. Local dependencies, lint and tests aren't needed for this change, because CI runs them on the PR.

## CI and deployment

CI runs lint and tests on every PR to `master` and on every push to `master`. Pushes to `master` also deploy to GitHub Pages, so merging a PR publishes it.
