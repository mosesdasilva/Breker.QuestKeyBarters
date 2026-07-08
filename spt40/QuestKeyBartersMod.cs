using SPTarkov.DI.Annotations;
using SPTarkov.Server.Core.DI;
using SPTarkov.Server.Core.Models.Common;
using SPTarkov.Server.Core.Models.Eft.Common.Tables;
using SPTarkov.Server.Core.Models.Utils;
using SPTarkov.Server.Core.Services;

namespace QuestKeyBarters.Spt40;

[Injectable(TypePriority = OnLoadOrder.PostDBModLoader + 1)]
public sealed class QuestKeyBartersMod(
    DatabaseService databaseService,
    ISptLogger<QuestKeyBartersMod> logger) : IOnLoad
{
    private const string ModName = "Breker's Quest Key Barters";
    private const string PraporId = "54cb50c76803fa8b248b4571";

    public Task OnLoad()
    {
        AddHardcodedDorm203Barter();
        logger.Success($"[{ModName}] Added hardcoded Dorm room 203 key barter milestone.");
        return Task.CompletedTask;
    }

    private void AddHardcodedDorm203Barter()
    {
        var traderData = databaseService.GetTables().Traders.GetValueOrDefault(PraporId);
        if (traderData is null)
        {
            logger.Error($"[{ModName}] Could not add milestone barter because Prapor was not found.");
            return;
        }

        var offerId = new MongoId();
        var itemToSell = new Item
        {
            Id = offerId,
            Template = new MongoId("5938504186f7740991483f30"),
            ParentId = "hideout",
            SlotId = "hideout",
            Upd = new Upd
            {
                UnlimitedCount = false,
                StackObjectsCount = 999999
            }
        };

        traderData.Assort.Items.Add(itemToSell);
        traderData.Assort.BarterScheme[offerId] =
        [
            [
                new BarterScheme
                {
                    Count = 1,
                    Template = new MongoId("57347c93245977448d35f6e3")
                },
                new BarterScheme
                {
                    Count = 2,
                    Template = new MongoId("590c5bbd86f774785762df04")
                }
            ]
        ];
        traderData.Assort.LoyalLevelItems[offerId] = 1;
    }
}
