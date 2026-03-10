import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import barters from "../config/barters.json";

type PriceMap = Record<string, number>;

const DORM_203_NAME = "Dorm room 203 key";
const DORM_203_ID = "5938504186f7740991483f30";
const PRICES_FILE = resolve(
    __dirname,
    "../../../Single Player Tarkov/SPT_Data/Server/database/templates/prices.json",
);

function loadPrices(): PriceMap
{
    return JSON.parse(readFileSync(PRICES_FILE, "utf-8")) as PriceMap;
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
});
