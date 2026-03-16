import type { DependencyContainer } from "tsyringe";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod"

import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { Traders } from "@spt/models/enums/Traders";
import { ITrader } from "@spt/models/eft/common/tables/ITrader";

import bartersJson from "../config/barters.json";

export interface BarterRequirement {
    count: number;
    _tpl: string;
}

export interface BarterConfig {
    id: string;
    trader: string;
    trader_loyalty_level: number;
    unlimited_stock: boolean;
    stock_amount: number;
    barter: BarterRequirement[];
}

type BarterConfigMap = Record<string, BarterConfig>;

const barters: BarterConfigMap = bartersJson;





class Mod implements IPostDBLoadMod {
    private readonly mongoIdRegex = /^[a-f0-9]{24}$/i;
    private localeGlobals?: Record<string, Record<string, string>>;

    
    logger: ILogger
    modName: string
    
    constructor(){ 
        this.modName = "Breker's Quest Key Barters"
    }

    public postDBLoad(container: DependencyContainer): void {
        this.logger = container.resolve<ILogger>("WinstonLogger");
        this.logger.log(`[${this.modName}] : Mod Loading`, LogTextColor.GREEN);
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const dbTables = databaseServer.getTables();
        this.localeGlobals = dbTables.locales?.global;
        const dbTraders = dbTables.traders;

        this.pushSupportiveBarters(dbTraders);
    }
    pushSupportiveBarters(dbTraders: Record<string, ITrader>):void{
        for (const [barterName, barter] of Object.entries(barters)){
            this.pushToTrader(barter, barter.id, dbTraders, barterName); 
        }
    }

    pushToTrader(
        barterConfig: BarterConfig,
        itemID: string,
        dbTraders: Record<string, ITrader>,
        barterName?: string,
    ){ 
        const validationErrors = this.validateBarterConfig(barterConfig);
        if (validationErrors.length > 0)
        {
            const configLabel = barterName ?? itemID;
            this.logger.log(
                `[${this.modName}] : Skipping invalid barter config '${configLabel}': ${validationErrors.join("; ")}`,
                LogTextColor.RED,
            );
            return;
        }

        const traderIDs = {
            mechanic: Traders.MECHANIC,
            skier: Traders.SKIER,
            peacekeeper: Traders.PEACEKEEPER,
            therapist: Traders.THERAPIST,
            prapor: Traders.PRAPOR,
            jaeger: Traders.JAEGER,
            ragman: Traders.RAGMAN
        };

        let traderToPush = barterConfig.trader;
        for (const [key, val] of Object.entries(traderIDs))
        {
            if (key === barterConfig.trader){
                traderToPush = val;
            }
        }
        const trader = dbTraders[traderToPush];
        if (!trader)
        {
            this.logger.log(
                `[${this.modName}] : Skipping barter for item ${this.getItemLogLabel(itemID)} because trader '${barterConfig.trader}' was not found`,
                LogTextColor.RED,
            );
            return;
        }

        const offerId = this.getUniqueOfferId(trader, itemID);

        trader.assort.items.push({
            _id: offerId,
            _tpl: itemID,
            parentId: "hideout",
            slotId: "hideout",
            upd:
            {
                UnlimitedCount: barterConfig.unlimited_stock,
                StackObjectsCount: barterConfig.stock_amount
            }
        });

        const barterTrade: BarterRequirement[] = [...barterConfig.barter];

        trader.assort.barter_scheme[offerId] = [barterTrade];
        trader.assort.loyal_level_items[offerId] = barterConfig.trader_loyalty_level;  
    }

    private validateBarterConfig(barterConfig: BarterConfig): string[]
    {
        const errors: string[] = [];

        if (!this.isNonEmptyString(barterConfig.id))
        {
            errors.push("item id cannot be empty");
        }

        if (!this.isNonEmptyString(barterConfig.trader))
        {
            errors.push("trader cannot be empty");
        }

        if (!Number.isInteger(barterConfig.trader_loyalty_level) || barterConfig.trader_loyalty_level < 1)
        {
            errors.push("trader loyalty level must be 1 or higher");
        }

        if (typeof barterConfig.unlimited_stock !== "boolean")
        {
            errors.push("unlimited stock must be true or false");
        }

        if (!Number.isInteger(barterConfig.stock_amount) || barterConfig.stock_amount < 1)
        {
            errors.push("stock amount must be 1 or higher");
        }

        if (!Array.isArray(barterConfig.barter) || barterConfig.barter.length === 0)
        {
            errors.push("barter items must contain at least one entry");
            return errors;
        }

        for (const [index, barterItem] of barterConfig.barter.entries())
        {
            const barterItemLabel = this.getBarterItemLogLabel(barterItem?._tpl, index);

            if (!Number.isFinite(barterItem?.count) || barterItem.count <= 0)
            {
                errors.push(`${barterItemLabel} quantity must be greater than 0`);
            }

            if (!this.isNonEmptyString(barterItem?._tpl))
            {
                errors.push(`barter item ${index + 1} id cannot be empty`);
            }
        }

        return errors;
    }

    private getUniqueOfferId(trader: ITrader, itemID: string): string
    {
        if (this.mongoIdRegex.test(itemID) && !this.offerIdExists(trader, itemID))
        {
            return itemID;
        }

        let candidate = this.generateMongoId();
        while (this.offerIdExists(trader, candidate))
        {
            candidate = this.generateMongoId();
        }

        return candidate;
    }

    private offerIdExists(trader: ITrader, offerId: string): boolean
    {
        const itemIdTaken = trader.assort.items.some((item: { _id: string }) => item._id === offerId);
        const barterIdTaken = trader.assort.barter_scheme[offerId] !== undefined;
        const loyaltyIdTaken = trader.assort.loyal_level_items[offerId] !== undefined;

        return itemIdTaken || barterIdTaken || loyaltyIdTaken;
    }

    private generateMongoId(): string
    {
        let id = "";
        const hexChars = "0123456789abcdef";

        for (let i = 0; i < 24; i++)
        {
            id += hexChars[Math.floor(Math.random() * hexChars.length)];
        }

        return id;
    }

    private getItemLogLabel(itemID: string): string
    {
        const itemName = this.getItemName(itemID);
        return itemName ? `'${itemName}' (${itemID})` : itemID;
    }

    private getBarterItemLogLabel(itemID: unknown, index: number): string
    {
        if (!this.isNonEmptyString(itemID))
        {
            return `barter item ${index + 1}`;
        }

        return `barter item ${this.getItemLogLabel(itemID)}`;
    }

    private getItemName(itemID: string): string | undefined
    {
        const localeKey = `${itemID} Name`;
        const englishName = this.localeGlobals?.en?.[localeKey];
        if (englishName)
        {
            return englishName;
        }

        for (const locale of Object.values(this.localeGlobals ?? {}))
        {
            const localizedName = locale[localeKey];
            if (localizedName)
            {
                return localizedName;
            }
        }

        return undefined;
    }

    private isNonEmptyString(value: unknown): value is string
    {
        return typeof value === "string" && value.trim().length > 0;
    }
}

export const mod = new Mod();
