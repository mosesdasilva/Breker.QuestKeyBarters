import type { DependencyContainer } from "tsyringe";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod"

import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { Traders } from "@spt/models/enums/Traders";
import { ITrader } from "@spt/models/eft/common/tables/ITrader";

import barters from "../config/barters.json";





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
        for (const barter of Object.keys(barters)){
            this.pushToTrader(barters[barter], barters[barter].id, dbTraders); 
        }
    }

    pushToTrader(barterConfig, itemID:string, dbTraders: Record<string, ITrader>,){ 
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

        const barterTrade: any = [];
        const configBarters = barterConfig.barter;

        for (const barter in configBarters){
            barterTrade.push(configBarters[barter]);
        }

        trader.assort.barter_scheme[offerId] = [barterTrade];
        trader.assort.loyal_level_items[offerId] = barterConfig.trader_loyalty_level;  
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
}

export const mod = new Mod();
