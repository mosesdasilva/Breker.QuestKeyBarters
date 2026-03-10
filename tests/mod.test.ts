import { beforeEach, describe, expect, it, vi } from "vitest";
import barters from "../config/barters.json";

vi.mock(
    "@spt/models/spt/logging/LogTextColor",
    () => ({
        LogTextColor: {
            GREEN: "GREEN",
        },
    }),
    { virtual: true },
);

vi.mock(
    "@spt/servers/DatabaseServer",
    () => ({
        DatabaseServer: class MockDatabaseServer {},
    }),
    { virtual: true },
);

vi.mock(
    "@spt/models/enums/Traders",
    () => ({
        Traders: {
            MECHANIC: "TRADER_MECHANIC",
            SKIER: "TRADER_SKIER",
            PEACEKEEPER: "TRADER_PEACEKEEPER",
            THERAPIST: "TRADER_THERAPIST",
            PRAPOR: "TRADER_PRAPOR",
            JAEGER: "TRADER_JAEGER",
            RAGMAN: "TRADER_RAGMAN",
        },
    }),
    { virtual: true },
);

import { Traders } from "@spt/models/enums/Traders";
import { mod } from "../src/mod";

type Assort = {
    items: Array<Record<string, unknown>>;
    barter_scheme: Record<string, unknown>;
    loyal_level_items: Record<string, number>;
};

type TraderMap = Record<string, { assort: Assort }>;

const createTrader = (): { assort: Assort } => ({
    assort: {
        items: [],
        barter_scheme: {},
        loyal_level_items: {},
    },
});

const createDbTraders = (): TraderMap => ({
    [Traders.MECHANIC]: createTrader(),
    [Traders.SKIER]: createTrader(),
    [Traders.PEACEKEEPER]: createTrader(),
    [Traders.THERAPIST]: createTrader(),
    [Traders.PRAPOR]: createTrader(),
    [Traders.JAEGER]: createTrader(),
    [Traders.RAGMAN]: createTrader(),
    CUSTOM_TRADER: createTrader(),
});

describe("Quest Key Barters mod", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("pushToTrader adds assort item, barter scheme, and loyalty level", () => {
        const dbTraders = createDbTraders();
        const itemId = "5938504186f7740991483f30";
        const barterConfig = {
            trader: "prapor",
            trader_loyalty_level: 2,
            unlimited_stock: true,
            stock_amount: 99,
            barter: [
                { count: 2, _tpl: "tpl-a" },
                { count: 1, _tpl: "tpl-b" },
            ],
        };

        mod.pushToTrader(barterConfig, itemId, dbTraders as never);

        expect(dbTraders[Traders.PRAPOR].assort.items).toHaveLength(1);
        const addedItem = dbTraders[Traders.PRAPOR].assort.items[0] as {
            _id: string;
            _tpl: string;
            parentId: string;
            slotId: string;
            upd: { UnlimitedCount: boolean; StackObjectsCount: number };
        };

        expect(addedItem._id).toBe(itemId);
        expect(addedItem._tpl).toBe(itemId);
        expect(addedItem.parentId).toBe("hideout");
        expect(addedItem.slotId).toBe("hideout");
        expect(addedItem.upd).toEqual({
            UnlimitedCount: true,
            StackObjectsCount: 99,
        });
        expect(dbTraders[Traders.PRAPOR].assort.barter_scheme[addedItem._id]).toEqual([barterConfig.barter]);
        expect(dbTraders[Traders.PRAPOR].assort.loyal_level_items[addedItem._id]).toBe(2);
    });

    it("pushToTrader supports direct trader IDs when no named mapping exists", () => {
        const dbTraders = createDbTraders();
        const itemId = "direct-id-item";
        const barterConfig = {
            trader: "CUSTOM_TRADER",
            trader_loyalty_level: 1,
            unlimited_stock: false,
            stock_amount: 3,
            barter: [{ count: 1, _tpl: "tpl-direct" }],
        };

        mod.pushToTrader(barterConfig, itemId, dbTraders as never);

        expect(dbTraders.CUSTOM_TRADER.assort.items).toHaveLength(1);
        const addedItem = dbTraders.CUSTOM_TRADER.assort.items[0] as { _id: string };
        expect(dbTraders.CUSTOM_TRADER.assort.barter_scheme[addedItem._id]).toEqual([barterConfig.barter]);
        expect(dbTraders.CUSTOM_TRADER.assort.loyal_level_items[addedItem._id]).toBe(1);
    });

    it("pushToTrader creates unique offer IDs for duplicate item IDs on the same trader", () => {
        const dbTraders = createDbTraders();
        const itemId = "5938504186f7740991483f30";
        const firstBarterConfig = {
            trader: "prapor",
            trader_loyalty_level: 1,
            unlimited_stock: false,
            stock_amount: 1,
            barter: [{ count: 1, _tpl: "tpl-a" }],
        };
        const secondBarterConfig = {
            trader: "prapor",
            trader_loyalty_level: 2,
            unlimited_stock: false,
            stock_amount: 1,
            barter: [{ count: 2, _tpl: "tpl-b" }],
        };

        mod.pushToTrader(firstBarterConfig, itemId, dbTraders as never);
        mod.pushToTrader(secondBarterConfig, itemId, dbTraders as never);

        const traderAssort = dbTraders[Traders.PRAPOR].assort;
        expect(traderAssort.items).toHaveLength(2);

        const firstOfferId = (traderAssort.items[0] as { _id: string })._id;
        const secondOfferId = (traderAssort.items[1] as { _id: string })._id;

        expect(firstOfferId).not.toBe(secondOfferId);
        expect(firstOfferId).toMatch(/^[a-f0-9]{24}$/i);
        expect(secondOfferId).toMatch(/^[a-f0-9]{24}$/i);
        expect(traderAssort.barter_scheme[firstOfferId]).toEqual([firstBarterConfig.barter]);
        expect(traderAssort.barter_scheme[secondOfferId]).toEqual([secondBarterConfig.barter]);
        expect(traderAssort.loyal_level_items[firstOfferId]).toBe(1);
        expect(traderAssort.loyal_level_items[secondOfferId]).toBe(2);
    });

    it("pushSupportiveBarters iterates over every barter config entry", () => {
        const dbTraders = createDbTraders();
        const pushToTraderSpy = vi.spyOn(mod, "pushToTrader").mockImplementation(() => {});

        mod.pushSupportiveBarters(dbTraders as never);

        expect(pushToTraderSpy).toHaveBeenCalledTimes(Object.keys(barters).length);
        for (const entry of Object.values(barters)) {
            expect(pushToTraderSpy).toHaveBeenCalledWith(entry, entry.id, dbTraders);
        }
    });

    it("postDBLoad resolves dependencies, logs startup, and pushes barters", () => {
        const dbTraders = createDbTraders();
        const logger = { log: vi.fn() };
        const databaseServer = {
            getTables: () => ({
                traders: dbTraders,
            }),
        };
        const container = {
            resolve: vi.fn((token: string) => {
                if (token === "WinstonLogger") {
                    return logger;
                }

                if (token === "DatabaseServer") {
                    return databaseServer;
                }

                throw new Error(`Unexpected token: ${token}`);
            }),
        };
        const pushSupportiveBartersSpy = vi
            .spyOn(mod, "pushSupportiveBarters")
            .mockImplementation(() => {});

        mod.postDBLoad(container as never);

        expect(container.resolve).toHaveBeenCalledWith("WinstonLogger");
        expect(container.resolve).toHaveBeenCalledWith("DatabaseServer");
        expect(logger.log).toHaveBeenCalledWith("[Breker's Quest Key Barters] : Mod Loading", "GREEN");
        expect(pushSupportiveBartersSpy).toHaveBeenCalledWith(dbTraders);
    });
});
