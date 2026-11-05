---
name: add-payment
description: Record a payment made by a family member in src/DB.js and open a pull request. Use when someone says they paid, topped up or sent money for Spotify, e.g. "Salvo paid 30 euro", "ho pagato 30 euro", "aggiungi un pagamento", "registra una somma pagata".
argument-hint: "[name] [amount] [date]"
---

# Add a payment

Family members record a payment by appending the amount to their `paid` array in `src/DB.js` and opening a PR. Merging to `master` deploys the site.

Reply in the language the user writes in.

## 1. Collect the details

Take these from the arguments or the conversation, and ask only for what is missing:

- **Member**: must match a `name` in `familyMembers` in `src/DB.js`, ignoring case. If the name matches nobody, list the existing names and ask. Do not add a new member: that also needs `emailHash` and `activeFrom`, and it is out of scope here. If the user says "I paid" without a name, ask who they are rather than guessing from the git identity.
- **Amount**: a positive number in euro with at most 2 decimals. Accept `30`, `30,50`, `30.50` and `30€`, and normalize to a JS number (`30.5`). If the amount is zero, negative or not a number, ask again.
- **Date**: when the payment was made, defaulting to today. It goes only in the commit message and PR title, because `DB.js` does not store dates.

## 2. Check for a duplicate

Run `git fetch origin master` and read `src/DB.js` from `origin/master`. If the member's array already ends with this same amount, tell the user and ask whether this is a new payment. Repeated amounts are normal (many people pay 30 each time), so ask and don't block.

## 3. Edit the file

Start from an up-to-date `master`, on a new branch named `<member>-<amount>eur-<YYYY-MM-DD>` in lowercase, with any decimal point replaced by `-` (for example `salvo-30-5eur-2026-10-22`).

Append the amount to the end of that member's `paid` array, on the existing line. Never reorder or change existing values, and don't touch anything else in the file.

```diff
-      paid: [30, 30, 30, 25, 30, 30, 30, 44, 30, 40, 30],
+      paid: [30, 30, 30, 25, 30, 30, 30, 44, 30, 40, 30, 30],
```

Then check that `git diff` shows exactly one changed line. Don't install dependencies or run lint and tests locally: CI runs them on the PR.

## 4. Confirm, then open the PR

Show the user the member, amount, date and the diff line, and wait for their confirmation before pushing, since this is visible to the whole family.

Then commit and push:

- Commit message and PR title: `<Member>, <amount> eur, <YYYY-MM-DD>` (for example `Salvo, 30 eur, 2026-10-22`).
- Family members usually don't have write access to `siuvdlec/spotify-spending-tracker`. If the push to `origin` is refused, run `gh repo fork --remote --remote-name fork` and push the branch to `fork`.
- Open the PR against `master` of `siuvdlec/spotify-spending-tracker` with `gh pr create`. If `gh` isn't installed or logged in, give the user the branch name and the compare URL so they can open it from the browser.

Finish by giving the user the PR link.
