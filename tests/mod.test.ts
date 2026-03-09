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
        const itemId = "test-item-id";
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

        expect(dbTraders[Traders.PRAPOR].assort.items).toEqual([
            {
                _id: itemId,
                _tpl: itemId,
                parentId: "hideout",
                slotId: "hideout",
                upd: {
                    UnlimitedCount: true,
                    StackObjectsCount: 99,
                },
            },
        ]);
        expect(dbTraders[Traders.PRAPOR].assort.barter_scheme[itemId]).toEqual([barterConfig.barter]);
        expect(dbTraders[Traders.PRAPOR].assort.loyal_level_items[itemId]).toBe(2);
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
        expect(dbTraders.CUSTOM_TRADER.assort.barter_scheme[itemId]).toEqual([barterConfig.barter]);
        expect(dbTraders.CUSTOM_TRADER.assort.loyal_level_items[itemId]).toBe(1);
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
