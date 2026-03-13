import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import barters from "../config/barters.json";

type PriceMap = Record<string, number>;
type ItemMap = Record<string, unknown>;

const BANNED_BARTER_TPLS = new Set([
    "5bc9be8fd4351e00334cae6e", // 42 Signature Blend English Tea
    "5bc9c1e2d4351e00367fbcf0", // Antique axe
    "60b0f988c4449e4cb624c1da", // Armband (Evasion)
    "62a091170b9d3c46de5b6cf2", // Axel parrot figurine
    "62a08f4c4f842e1bd12d9d62", // BEAR Buddy plush toy
    "62a09dd4621468534a797ac7", // Baddie's red beard
    "62a09e73af34e73a266d932a", // BakeEzy cook book
    "5bc9c049d4351e44f824d360", // Battered antique book
    "5e54f6af86f7742199090bf3", // Can of Dr. Lupo's coffee beans
    "60b0f93284c20f0feb453da7", // Can of RatCola soda
    "5bc9c29cd4351e003562b8a3", // Can of sprats
    "62a09d79de7ac81993580530", // DRD body armor
    "5bc9b9ecd4351e3bac122519", // Deadlyslob's beard oil
    "5bd073a586f7747e6f135799", // Fake mustache
    "5bc9b355d4351e6d1509862a", // FireKlean gun lube
    "62a09d3bcf4a99369e262447", // Gingy keychain
    "62a09e08de7ac81993580532", // Glorious E mask
    "5bc9b720d4351e450201234b", // Golden 1GPhone smartphone
    "62a09cfe4f842e1bd12da3e4", // Golden egg
    "5bc9bc53d4351e00367fbcee", // Golden rooster figurine
    "66b37f114410565a8f6789e2", // Inseq gas pipe wrench
    "5bc9b156d4351e00367fbce9", // DevilDog mayo
    "62a09e410b9d3c46de5b6e78", // JohnB glasses
    "5bd073c986f7747f627e796c", // Kotton beanie
    "60b0f561c4449e4cb624c1d7", // LVNDMARK's rat poison
    "60b0f7057897d47c5b04ab94", // Loot Lord plushie
    "62a09ec84f842e1bd12da3f2", // Missam forklift key
    "5bc9c377d4351e3bac12251b", // Old firesteel
    "5e54f79686f7744022011103", // Pestily plague mask
    "62a09cb7a04c0c5c6e0a84f8", // Press pass (issued for NoiceGuy)
    "5e54f62086f774219b0f1937", // Raven figurine
    "5e54f76986f7740366043752", // Shroud half-mask
    "5bc9bdb8d4351e003562b8a1", // Silver Badge
    "5fd8d28367cb5e077335170f", // Smoke balaclava
    "66b37ea4c5d72b0277488439", // Tamatthi kunai knife replica
    "5f745ee30acaeb0d490d8c5b", // Veritas guitar pick
    "62a09e974f842e1bd12da3f0", // Cyborg Killer videocassette
    "66b37eb4acff495a29492407", // Viibiin sneaker
    "60b0f6c058e0b0481a09ad11", // WZ Wallet
    "5d235b4d86f7742e017bc88a", // GP coin
    "6389c7750ef44505c87f5996", // Microcontroller board
    "6389c85357baa773a825b356", // Advanced current converter
    "66d9f7e7099cf6adcc07a369", // KOSA UAV electronic jamming device
    "66d9f7256916142b3b02276e", // Radar station spare parts
]);

const DORM_203_NAME = "Dorm room 203 key";
const DORM_203_ID = "5938504186f7740991483f30";
const PRICES_FILE = resolve(
    __dirname,
    "../database/templates/prices.json",
);
const ITEMS_FILE = resolve(
    __dirname,
    "../database/templates/items.json",
);

function loadPrices(): PriceMap
{
    return JSON.parse(readFileSync(PRICES_FILE, "utf-8")) as PriceMap;
}

function loadItems(): Set<string>
{
    const itemMap = JSON.parse(readFileSync(ITEMS_FILE, "utf-8")) as ItemMap;
    return new Set(Object.keys(itemMap));
}

function calculateBarterTotal(
    barterItems: Array<{ count: number; _tpl: string }>,
    prices: PriceMap,
): number
{
    return barterItems.reduce((sum, item) =>
    {
        const itemPrice = prices[item._tpl];
        if (itemPrice === undefined)
        {
            throw new Error(`Missing price for tpl: ${item._tpl}`);
        }

        return sum + (item.count * itemPrice);
    }, 0);
}

describe("barters config", () =>
{
    it("keeps Dorm 203 key on prapor with expected stock settings", () =>
    {
        const dorm203 = barters[DORM_203_NAME];

        expect(dorm203).toBeDefined();
        expect(dorm203.id).toBe(DORM_203_ID);
        expect(dorm203.trader).toBe("prapor");
        expect(dorm203.trader_loyalty_level).toBe(1);
        expect(dorm203.unlimited_stock).toBe(false);
        expect(dorm203.stock_amount).toBe(1);
        expect(Array.isArray(dorm203.barter)).toBe(true);
        expect(dorm203.barter.length).toBeGreaterThan(0);
    });

    it("sets Dorm 203 barter total within 500 roubles of key base price", () =>
    {
        const prices = loadPrices();
        const keyBasePrice = prices[DORM_203_ID];
        const dorm203 = barters[DORM_203_NAME];
        const barterTotal = calculateBarterTotal(dorm203.barter, prices);

        expect(keyBasePrice).toBeDefined();
        expect(Math.abs(barterTotal - keyBasePrice)).toBeLessThanOrEqual(500);
    });

    it("uses only item IDs that exist in SPT items database", () =>
    {
        const itemIds = loadItems();
        const missingIds: Array<string> = [];

        for (const [barterName, config] of Object.entries(barters))
        {
            if (!itemIds.has(config.id))
            {
                missingIds.push(`${barterName}: key id ${config.id}`);
            }

            for (const barterItem of config.barter)
            {
                if (!itemIds.has(barterItem._tpl))
                {
                    missingIds.push(
                        `${barterName}: barter item _tpl ${barterItem._tpl}`,
                    );
                }
            }
        }

        expect(missingIds).toEqual([]);
    });

    it("keeps normal-mode barter quantities varied and capped", () =>
    {
        const quantityIssues: Array<string> = [];

        for (const [barterName, config] of Object.entries(barters))
        {
            const totalCount = config.barter.reduce(
                (sum, barterItem) => sum + barterItem.count,
                0,
            );

            if (totalCount > 15)
            {
                quantityIssues.push(
                    `${barterName}: total barter count ${totalCount} exceeds 15`,
                );
            }

            for (const barterItem of config.barter)
            {
                if (barterItem.count > 10)
                {
                    quantityIssues.push(
                        `${barterName}: ${barterItem._tpl} count ${barterItem.count} exceeds 10`,
                    );
                }
            }
        }

        expect(quantityIssues).toEqual([]);
    });

    it("avoids banned streamer and late-game barter items", () =>
    {
        const bannedItemsUsed: Array<string> = [];

        for (const [barterName, config] of Object.entries(barters))
        {
            for (const barterItem of config.barter)
            {
                if (BANNED_BARTER_TPLS.has(barterItem._tpl))
                {
                    bannedItemsUsed.push(
                        `${barterName}: barter item _tpl ${barterItem._tpl}`,
                    );
                }
            }
        }

        expect(bannedItemsUsed).toEqual([]);
    });
});
