import type { DependencyContainer } from "tsyringe";
import type { ILogger } from "@spt/models/spt/utils/ILogger";
import type { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod"
//Why these down below does not need to declare type after import?
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { Traders } from "@spt/models/enums/Traders";
import { ITrader } from "@spt/models/eft/common/tables/ITrader";

import barters from "../config/barters.json"; // why does this one doesnot have {}???





class Mod implements IPostDBLoadMod {

    //wwhy is these 6 next lines necessary?
    logger: ILogger
    modName: string
    modVersion: string
    container: DependencyContainer
    itemHelper: ItemHelper;
    config:any

    constructor(){ //What does constructor do? 
        this.modName = "Breker's Quest Key Barters"
    }

    //Why does VSCODE auto-complete the postDBLoad like this? What does each word do?
    public postDBLoad(container: DependencyContainer): void {
        this.logger = container.resolve<ILogger>("WinstonLogger");// why do I need to write this to use the logger?
        this.logger.log(`[${this.modName}] : Mod Loading`, LogTextColor.GREEN);
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer"); // why do I need to write this to use databaseServer?
        const dbTables = databaseServer.getTables();// Why do I need to use() after getTables?
        const dbTemplates = dbTables.templates;
        const dbTraders = dbTables.traders;
        const dbItems = dbTemplates.items;

        this.pushSupportiveBarters(dbTraders);
    }
    //i have no idea why this is down here, need explation character by character
    //also why did write this after "this.pushSupportiveBarters(dbTraders);" and not before?
    pushSupportiveBarters(dbTraders: Record<string, ITrader>):void{
        for (const barter of Object.keys(barters)){
            this.pushToTrader(barters[barter], barters[barter].id, dbTraders); 
        }
    }

    //why is this declared after the code block above and not before???
    //need explantion for this whole block below in plain english, word for word, dont know why I need this
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