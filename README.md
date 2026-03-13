# Breker's Quest Key Barters

Breker's Quest Key Barters adds progression-friendly trader barters for quest keys so you are less likely to get hard-stalled by random spawns.

The mod stays intentionally simple:
- no new trader
- no runtime preset loader
- no extra systems beyond trader assort injection

## What You Get

- `49` barter offers focused on quest-relevant keys
- Covers early and mid progression bottlenecks across `7` traders
- Limited-stock offers by default to keep progression intact
- Rebalanced barter costs to be more consistent and less abusable
- Duplicate key offers are supported safely when intentional

Current setup includes `49` barter offers.

## Who This Is For

- Players who get blocked by missing quest keys
- Players who want a more consistent, less RNG-heavy experience
- Players who still want progression limits instead of free infinite keys

## Compatibility

- SPT `~3.11.0`

## How To Install

1. Download the release zip.
2. Extract `user/mods/breker-questkeybarters` into your SPT directory.
3. Confirm the final path looks like `SPT/user/mods/breker-questkeybarters/package.json`.
4. Start the SPT server.

Packaged releases intentionally contain only:
- `package.json`
- `src/`
- `config/`

## How To Update

1. Close SPT.
2. Delete the existing `SPT/user/mods/breker-questkeybarters` folder.
3. Extract the new version.
4. Start SPT again.

## Notes

- This mod changes trader offers only.
- It does not add a new trader.
- It is intended to feel helpful, not overpowered.
- The current release package includes only install-relevant files:
  - `package.json`
  - `src/`
  - `config/`

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

## Technical Info (Optional)

- Main active config file: `config/barters.json`
- Offers are injected into existing trader assort data during `postDBLoad()`
- If the same key is reused on one trader, the mod generates a unique Mongo-style offer ID safely

## Custom Config Guide

Want to add your own keys or custom barter trades? Edit `config/barters.json`.

Use this website to look up item IDs (`_tpl` values):
- https://db.sp-tarkov.com/search

Each config entry defines:
- sold item ID
- trader
- trader loyalty level required
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

Best practices:
- keep valid JSON
- do not remove the top-level `{}`
- put commas between entries, but not after the last entry
- keep `count` numeric
- use valid SPT item IDs for `id` and `_tpl`
- keep offers helpful, limited, and progression-friendly
- if SPT fails to start after an edit, check your last JSON changes first

## Troubleshooting

- No barters appear:
  - confirm the install path is `SPT/user/mods/breker-questkeybarters`
  - confirm `package.json` exists in that folder
  - confirm your SPT version matches `~3.11.0`
  - check the server log for `[Breker's Quest Key Barters] : Mod Loading`

- Changed a config and SPT fails to start:
  - re-check your JSON formatting first
  - verify trader names and item IDs are valid

## Keys by Trader (default config)

### Prapor

- Dorm room 203 key
- Dorm room 214 key
- Factory emergency exit key
- Tarcone Director's office key
- Trailer park portable cabin key

### Skier

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

### Peacekeeper

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

### Therapist

- Cottage back door key
- Dorm room 114 key
- Dorm room 206 key
- Health Resort west wing room 306 key
- RB-KSM key
- RB-SMP key
- X-ray room key

### Mechanic

- Concordia security room key
- Health Resort office key with a blue tape
- Operating room key
- Pinewood hotel room 215 key
- RB-ST key 2
- Tarcone Director's office key 2

### Ragman

- Goshan cash register key
- OLI logistics department office key
- RB-OB key
- RB-ORB1 key
- RB-ORB2 key
- RB-ORB3 key
- Ushanka ear flap hat

### Jaeger

- Abandoned factory marked key
- Mysterious room marked key
- TerraGroup storage room keycard
- ZB-014 key

## License

MIT
