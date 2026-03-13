# Breker's Quest Key Barters

Breker's Quest Key Barters adds progression-friendly trader barters for quest keys so you are less likely to get hard-stalled by random spawns.

The mod stays intentionally simple:
- no new trader
- no runtime preset loader
- no extra systems beyond trader assort injection

## Highlights

- `49` barter offers focused on quest-relevant keys
- Covers early and mid progression bottlenecks across `7` traders
- Limited-stock offers by default to keep progression intact
- Rebalanced barter costs to be more consistent and less abusable
- Duplicate key offers are supported safely when intentional
- Includes alternate preset configs for manual swapping:
  - `config/presets/normal-mode/barters.json`
  - `config/presets/easy-mode/barters.json`

## Compatibility

- SPT `~3.11.0`

## Installation

1. Download the release zip.
2. Extract `user/mods/breker-questkeybarters` into your SPT directory.
3. Confirm the final path looks like `SPT/user/mods/breker-questkeybarters/package.json`.
4. Start the SPT server.

Packaged releases intentionally contain only:
- `package.json`
- `src/`
- `config/`

## Updating

1. Close SPT.
2. Delete the existing `SPT/user/mods/breker-questkeybarters` folder.
3. Extract the new version.
4. Start SPT again.

## What It Changes

- Adds new barter offers to existing traders
- Reads barter definitions from `config/barters.json`
- Pushes offers into trader assort data during `postDBLoad()`
- Generates unique Mongo-style offer IDs when the same item is reused on one trader

## Trader Coverage

- Prapor: `5`
- Skier: `10`
- Peacekeeper: `10`
- Therapist: `7`
- Mechanic: `6`
- Ragman: `7`
- Jaeger: `4`

## Included Presets

The runtime loads only:
- `config/barters.json`

The preset files are included for manual swapping:
- `config/presets/normal-mode/barters.json`
- `config/presets/easy-mode/barters.json`

If you want a different preset active, replace `config/barters.json` with the preset you want to use.

## Customizing Barters

Each barter entry defines:
- the sold item ID
- trader
- trader loyalty requirement
- stock behavior
- required barter items

Example entry:

```json
"Dorm room 203 key": {
  "id": "5938504186f7740991483f30",
  "trader": "prapor",
  "trader_loyalty_level": 1,
  "unlimited_stock": false,
  "stock_amount": 1,
  "barter": [
    {
      "count": 1,
      "_tpl": "57347c93245977448d35f6e3"
    },
    {
      "count": 2,
      "_tpl": "590c5bbd86f774785762df04"
    }
  ]
}
```

Allowed trader names:
- `prapor`
- `skier`
- `peacekeeper`
- `therapist`
- `mechanic`
- `ragman`
- `jaeger`

Editing rules:
- keep valid JSON
- keep `count` numeric
- use valid SPT item IDs for `id` and `_tpl`
- keep offers helpful, limited, and progression-friendly

## Validation

The repo includes test coverage for:
- trader insertion behavior
- duplicate offer ID handling
- valid config item IDs
- balance checks for selected barters
- quantity and banned-item guardrails

Typical validation flow:

```bash
npm test
```

## Troubleshooting

- No barters appear:
  - confirm the install path is `SPT/user/mods/breker-questkeybarters`
  - confirm `package.json` exists in that folder
  - confirm your SPT version matches `~3.11.0`
  - check the server log for `[Breker's Quest Key Barters] : Mod Loading`

- Changed a config and SPT fails to start:
  - re-check your JSON formatting first
  - verify trader names and item IDs are valid

## License

MIT
