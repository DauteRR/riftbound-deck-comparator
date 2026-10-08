<div align="center">

<img src="public/logo.png" alt="Riftbound Deck Comparator logo" width="160" />

# Riftbound Deck Comparator

<p>Two decks. One glance. Every difference</p>

</div>

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

## 🤝 Contributing

Contributions are welcome! If you want to add a feature or fix something, open a pull request. For anything big, please open an issue first so we can talk about it.

## 🐛 Found a bug?

If you find a bug, a wrong comparison or any behavior that looks off, I would really appreciate it if you let me know by [opening an issue](https://github.com/DauteRR/riftbound-deck-comparator/issues). Including the two decks (the deck codes or the decklists) that triggered it makes it much easier to reproduce.

Ideas and suggestions are welcome there too.

## 📜 Disclaimer

Riftbound Deck Comparator is an unofficial fan project. It is not affiliated with, endorsed or sponsored by Riot Games, Riftbound or League of Legends. It was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riftbound, League of Legends, and all related names, card text and artwork are trademarks or property of Riot Games, Inc.
