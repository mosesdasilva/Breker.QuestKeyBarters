# Breker's Quest Key Barters

This mod adds fair trader barters for many quest keys, so you are not stuck waiting on random key spawns.

If you play SPT and want smoother quest progression, this is made for you.

## What You Get

- More key barter options directly from traders
- Focus on quest-relevant keys across early and mid progression
- Limited stock offers (so progression still feels balanced)
- Barters spread across multiple traders instead of one place

Current setup includes `49` barter offers.

## Who This Is For

- Players who get blocked by missing quest keys
- Players who want a more consistent, less RNG-heavy experience
- Players who still want progression limits (not free infinite keys)

## Compatibility

- Built for SPT `~3.11.0`

## How To Install

1. Download this mod.
2. Put the `Quest Key Barters` folder named `user` into your SPT folder.
3. Start your SPT server.
4. Launch the game and check traders for new key barters.

## How To Update

1. Close SPT.
2. Delete the old `Quest Key Barters` folder from `SPT\user\mods\`.
3. Copy in the new version.
4. Start SPT again.

## How To Remove

1. Close SPT.
2. Delete `SPT\user\mods\Quest Key Barters`.
3. Start SPT again.

## Notes

- This mod changes trader offers only.
- It does not add a new trader.
- It is intended to feel helpful, not overpowered.

## Troubleshooting

- Do not see barters?
  - Confirm the folder path is exactly `SPT\user\mods\Quest Key Barters`.
  - Make sure your SPT version matches (`~3.11.0`).
  - Check server console/log for:
    - `[Breker's Quest Key Barters] : Mod Loading`

## Technical Info (Optional)

- Main config file: `config/barters.json`
- Trader coverage:
  - Prapor: `5`
  - Skier: `10`
  - Peacekeeper: `10`
  - Therapist: `7`
  - Mechanic: `6`
  - Ragman: `7`
  - Jaeger: `4`

Each config entry defines:
- Key item ID
- Trader
- Trader loyalty level required
- Stock behavior
- Required barter items

### Custom Config Guide

Want to add your own keys or custom barter trades? Edit `config/barters.json`.

Use this website to look up item IDs (`_tpl` values):
- https://db.sp-tarkov.com/search

Use this structure for each entry:

```json
"Your custom key name": {
  "id": "item_tpl_id_of_the_key",
  "trader": "prapor",
  "trader_loyalty_level": 1,
  "unlimited_stock": false,
  "stock_amount": 1,
  "barter": [
    {
      "count": 1,
      "_tpl": "required_item_tpl_id_1"
    },
    {
      "count": 2,
      "_tpl": "required_item_tpl_id_2"
    }
  ]
}
```

#### Best Practices (Important)

- Keep valid JSON format (quotes, commas, and brackets must be correct).
- Do not remove the top-level `{}` from `barters.json`.
- Put a comma between entries, but not after the last entry.
- Keep `count` as a number (`1`, `2`, etc.), not text (`"1"`).
- Use valid trader names:
  - `prapor`
  - `skier`
  - `peacekeeper`
  - `therapist`
  - `mechanic`
  - `ragman`
  - `jaeger`
- Keep `id` and `_tpl` values as valid item IDs from the database.
- If SPT fails to start after an edit, check your last JSON changes first.

### Keys by Trader (from config)

#### Prapor
- Dorm room 203 key
- Dorm room 214 key
- Factory emergency exit key
- Tarcone Director's office key
- Trailer park portable cabin key

#### Skier
- Chekannaya 15 apartment key
- Dorm room 220 key
- Dorm room 303 key
- EMERCOM medical unit key
- Health Resort east wing room 306 key
- Health Resort east wing room 308 key
- Health Resort west wing office room 112 key
- Health Resort west wing room 216 key
- Iron gate key
- Radar station commandant room key

#### Peacekeeper
- Car dealership closed section key
- Car dealership director's office room key
- Dorm room 314 marked key
- Health Resort east wing room 306 key 2
- Health Resort east wing room 308 key 2
- Health Resort east wing room 328 key
- Health Resort west wing room 219 key
- Health Resort west wing room 220 key
- RB-ST key
- TerraGroup Labs weapon testing area key

#### Therapist
- Cottage back door key
- Dorm room 114 key
- Dorm room 206 key
- Health Resort west wing room 306 key
- RB-KSM key
- RB-SMP key
- X-ray room key

#### Mechanic
- Concordia security room key
- Health Resort office key with a blue tape
- Operating room key
- Pinewood hotel room 215 key
- RB-ST key 2
- Tarcone Director's office key 2

#### Ragman
- Goshan cash register key
- OLI logistics department office key
- RB-OB key
- RB-ORB1 key
- RB-ORB2 key
- RB-ORB3 key
- Ushanka ear flap hat

#### Jaeger
- Abandoned factory marked key
- Mysterious room marked key
- TerraGroup storage room keycard
- ZB-014 key

## License

MIT (see `LICENSE`)
