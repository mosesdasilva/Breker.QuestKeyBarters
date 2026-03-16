# Config Format

## Purpose
`config/barters.json` defines the barter offers this mod injects into trader assort data.

The runtime currently loads only:
- `config/barters.json`

Preset files under `config/presets/` are reference or manual-swap variants unless the runtime is changed.

## Entry Shape
Each top-level property is a human-readable barter name.

Example:

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

## Fields
- `id`: the item `_tpl` of the key or item being sold
- `trader`: trader name used by the runtime mapping
- `trader_loyalty_level`: required trader loyalty level
- `unlimited_stock`: whether the offer is unlimited
- `stock_amount`: stack or stock amount placed on the assort item
- `barter`: array of required barter items

Each barter item requires:
- `count`: numeric quantity
- `_tpl`: item ID for the required barter item

## Allowed Trader Names
Current runtime mapping supports:
- `prapor`
- `skier`
- `peacekeeper`
- `therapist`
- `mechanic`
- `ragman`
- `jaeger`

## Editing Rules
- Keep valid JSON.
- Keep `count` values numeric.
- Use valid SPT item IDs for `id` and every barter `_tpl`.
- Keep barter offers progression-friendly and limited.
- Prefer small config edits over broad rebalance passes unless explicitly requested.
- Be careful with duplicate offers for the same item on the same trader; runtime supports them, but they should be intentional.

## What Tests Already Enforce
`tests/barters-config.test.ts` currently checks:
- Dorm 203 remains present with expected trader and stock setup
- Dorm 203 barter total stays within 500 roubles of base key price
- all item IDs exist in the local SPT item database
- barter quantities stay capped
- banned streamer and late-game items are not used

## Safe Change Checklist
When editing `config/barters.json`:
1. change only the intended entries
2. keep JSON valid
3. run `npm test`
4. review the barter for progression balance
5. call out any assumptions not proven by tests

## Known Limitations
- The runtime skips malformed barter records with log output, but there is still no standalone schema file or preflight validator tool.
- Preset files are not auto-selected by runtime.
