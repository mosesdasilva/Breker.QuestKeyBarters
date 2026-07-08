# SPT 4.0 Port Design

## Context

The SPT 3.11 mod is a TypeScript server mod loaded through `postDBLoad()`. SPT 4.0 server mods in the local `4.0.13` install are C# projects targeting `net9.0`, with `AbstractModMetadata` and injectable `IOnLoad` classes.

## Decision

Create a separate C# project under `spt40/` and keep the TypeScript mod unchanged for SPT 3.11.

The C# port packages the existing root `config/barters.json` as linked content instead of maintaining a second barter data file. This keeps gameplay balance and future config edits in one source of truth.

The runtime loads after the database mod loader and mutates each target trader's assort through SPT 4.0 typed database models:

- append a root item to `assort.items`
- add a barter requirement under `assort.barter_scheme`
- set the loyalty level under `assort.loyal_level_items`
- generate a fresh offer ID for each configured barter so duplicate sold item templates cannot collide
- set stock from `stock_amount` without setting buy restriction fields

## Assumptions

- SPT 4.0 trader IDs are unchanged for the built-in traders used by the current config.
- SPT 4.0 trader assorts accept the same logical data used by the SPT 3.11 TypeScript mod: sold item, barter scheme, and loyalty level.

## Validation

The local environment was set up with the .NET 9 SDK and the standard NuGet.org package source. Build validation is:

```powershell
dotnet build .\spt40\QuestKeyBarters.Spt40.csproj -c Release
```

The Release output is generated under `spt40/bin/Release/BrekerQuestKeyBarters/` and includes the DLL plus linked `config/barters.json`.

Runtime smoke testing on SPT 4.0.13 confirmed that all 49 entries from `config/barters.json` are added and visible in-game.
