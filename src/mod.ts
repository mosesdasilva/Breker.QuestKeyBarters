import type { DependencyContainer } from "tsyringe";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod"

import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { Traders } from "@spt/models/enums/Traders";
import { ITrader } from "@spt/models/eft/common/tables/ITrader";

import barters from "../config/barters.json";





class Mod implements IPostDBLoadMod {

    
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

        trader.assort.items.push({
            _id: itemID,
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

        trader.assort.barter_scheme[itemID] = [barterTrade];
        trader.assort.loyal_level_items[itemID] = barterConfig.trader_loyalty_level;  
    }
}

export const mod = new Mod();