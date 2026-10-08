# Riftbound Deck Comparator

> 🔍 **Two decks. One glance. Every difference.**

Paste two [Riftbound](https://playriftbound.com) decklists and instantly see which cards differ: in the main deck, the runes, the sideboard and the battlefields. You also get an exact list of swaps to turn one deck into the other on the table.

## ✨ What can you do with it?

- Compare your list against a tournament-winning one.
- Spot the sideboard changes between two versions of the same deck.
- Get a remove / move / add checklist to rebuild a physical deck, including cards that move between the main deck and the sideboard.
- Share a comparison with a single link.

## 🧭 How it works

1. Paste a decklist or a deck code on each side.
2. See the differences section by section (legend and chosen champion, main deck, sideboard, battlefields and runes), with card art.
3. Copy the link and share it.

## 🚧 Status

Work in progress. The card data pipeline is ready; the app itself is under construction.

## 🛠️ Development

You need [Node.js](https://nodejs.org) 22.18 or newer and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

Other useful scripts: `pnpm build`, `pnpm test` and `pnpm lint`.

### 🃏 Updating the card data

The app reads its cards from `src/data/cards.json`, which is generated from the official Riftbound card gallery:

```bash
pnpm update-cards
```

The script downloads the gallery, filters and converts the cards, and rewrites `src/data/cards.json`.

> ⚠️ **Important:** the app only knows the cards that are in that file. Run `pnpm update-cards` and commit the result **every time a new set comes out** (and whenever new cards are revealed). Otherwise, decks that use the new cards will show them as unknown.

## 📜 Disclaimer

Riftbound Deck Comparator is an unofficial fan project. It is not affiliated with, endorsed or sponsored by Riot Games, Riftbound or League of Legends. It was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riftbound, League of Legends, and all related names, card text and artwork are trademarks or property of Riot Games, Inc.
