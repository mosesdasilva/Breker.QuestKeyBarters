# Breker's Quest Key Barters for SPT 4.0

Server-side SPT 4.0 C# port of the TypeScript Quest Key Barters mod.

## Install

1. Build the project with the .NET 9 SDK:

   ```powershell
   dotnet build .\spt40\QuestKeyBarters.Spt40.csproj -c Release
   ```

2. Copy the built `BrekerQuestKeyBarters` folder into:

   ```text
   SPT\user\mods\BrekerQuestKeyBarters
   ```

## Config

The SPT 4.0 port packages the same `config/barters.json` data used by the SPT 3.11 TypeScript mod.

Each barter entry keeps this shape:

```json
{
  "Dorm room 203 key": {
    "id": "5938504186f7740991483f30",
    "trader": "prapor",
    "trader_loyalty_level": 1,
    "unlimited_stock": false,
    "stock_amount": 1,
    "barter": [
      { "count": 1, "_tpl": "57347c93245977448d35f6e3" }
    ]
  }
}
```

Named trader aliases are `prapor`, `therapist`, `skier`, `peacekeeper`, `mechanic`, `ragman`, and `jaeger`.

The C# port uses `stock_amount` for trader stock and does not set buy restriction fields.
