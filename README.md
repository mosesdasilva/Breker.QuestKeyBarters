# Breker's Quest Key Barters

Adds practical trader barters for quest-focused keys so progression is less dependent on RNG key spawns.

## What This Mod Does

- Injects additional key barter offers into trader assortments on server load.
- Targets early-access and quest-relevant keys across multiple traders.
- Keeps offers stock-limited (not unlimited) to preserve progression pacing.
- Supports duplicate key entries safely by generating unique valid offer IDs when needed.

## Current Coverage

- `49` barter entries total.
- Trader distribution:
  - Prapor: `5`
  - Skier: `10`
  - Peacekeeper: `10`
  - Therapist: `7`
  - Mechanic: `6`
  - Ragman: `7`
  - Jaeger: `4`

Main config file: `config/barters.json`

## Compatibility

- SPT version: `~3.11.0`
- Mod type: Server-side (`postDBLoad` injection)

## Installation

1. Download or clone this mod.
2. Place the mod folder into your SPT user mods directory.
3. Start the SPT server.

Expected startup log:
`[Breker's Quest Key Barters] : Mod Loading`

## Configuration

All barter definitions are in `config/barters.json`.

Each entry uses this structure:

```json
"Some key name": {
  "id": "item_tpl_id",
  "trader": "prapor",
  "trader_loyalty_level": 1,
  "unlimited_stock": false,
  "stock_amount": 1,
  "barter": [
    { "count": 1, "_tpl": "required_item_tpl_1" },
    { "count": 2, "_tpl": "required_item_tpl_2" }
  ]
}
```

### Field Notes

- `id`: Item tpl of the item being sold (usually the key).
- `trader`: Trader name (`prapor`, `skier`, `peacekeeper`, `therapist`, `mechanic`, `ragman`, `jaeger`) or direct trader ID.
- `trader_loyalty_level`: Required trader level.
- `unlimited_stock`: `true` for infinite restock, `false` for limited stock.
- `stock_amount`: Quantity per reset.
- `barter`: Required items and counts.

## License

MIT (see `LICENSE`)
