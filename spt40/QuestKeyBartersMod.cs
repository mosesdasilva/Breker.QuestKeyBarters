using System.Reflection;
using System.Text.Json.Serialization;
using SPTarkov.DI.Annotations;
using SPTarkov.Server.Core.DI;
using SPTarkov.Server.Core.Helpers;
using SPTarkov.Server.Core.Models.Common;
using SPTarkov.Server.Core.Models.Eft.Common.Tables;
using SPTarkov.Server.Core.Models.Utils;
using SPTarkov.Server.Core.Services;

namespace QuestKeyBarters.Spt40;

[Injectable(TypePriority = OnLoadOrder.PostDBModLoader + 1)]
public sealed class QuestKeyBartersMod(
    DatabaseService databaseService,
    ModHelper modHelper,
    ISptLogger<QuestKeyBartersMod> logger) : IOnLoad
{
    private const string ModName = "Breker's Quest Key Barters";

    private static readonly Dictionary<string, string> TraderIds = new(StringComparer.OrdinalIgnoreCase)
    {
        ["prapor"] = "54cb50c76803fa8b248b4571",
        ["therapist"] = "54cb57776803fa99248b456e",
        ["skier"] = "58330581ace78e27b8b10cee",
        ["peacekeeper"] = "5935c25fb3acc3127c3d8cd9",
        ["mechanic"] = "5a7c2eca46aef81a7ca2145d",
        ["ragman"] = "5ac3b934156ae10c4430e83c",
        ["jaeger"] = "5c0647fdd443bc2504c2d371",
    };

    public Task OnLoad()
    {
        var barters = LoadBarters();
        var addedCount = 0;
        var skippedCount = 0;

        foreach (var (barterName, barter) in barters)
        {
            if (AddConfiguredBarter(barterName, barter))
            {
                addedCount++;
            }
            else
            {
                skippedCount++;
            }
        }

        logger.Success($"[{ModName}] Added {addedCount} quest-key barters from config/barters.json. Skipped {skippedCount}.");
        return Task.CompletedTask;
    }

    private Dictionary<string, BarterConfig> LoadBarters()
    {
        var pathToMod = modHelper.GetAbsolutePathToModFolder(Assembly.GetExecutingAssembly());
        return modHelper.GetJsonDataFromFile<Dictionary<string, BarterConfig>>(pathToMod, "config/barters.json");
    }

    private bool AddConfiguredBarter(string barterName, BarterConfig barter)
    {
        var errors = Validate(barter);
        if (errors.Count > 0)
        {
            logger.Error($"[{ModName}] Skipping invalid barter config '{barterName}': {string.Join("; ", errors)}");
            return false;
        }

        var traderId = TraderIds.GetValueOrDefault(barter.Trader, barter.Trader);
        var traderData = databaseService.GetTables().Traders.GetValueOrDefault(traderId);
        if (traderData is null)
        {
            logger.Error($"[{ModName}] Could not add '{barterName}' because trader '{barter.Trader}' was not found.");
            return false;
        }

        var offerId = new MongoId();
        var itemToSell = new Item
        {
            Id = offerId,
            Template = new MongoId(barter.Id),
            ParentId = "hideout",
            SlotId = "hideout",
            Upd = new Upd
            {
                UnlimitedCount = barter.UnlimitedStock,
                StackObjectsCount = barter.StockAmount
            }
        };

        traderData.Assort.Items.Add(itemToSell);
        traderData.Assort.BarterScheme[offerId] = [barter.Barter.Select(requirement => new BarterScheme
        {
            Count = requirement.Count,
            Template = new MongoId(requirement.TemplateId)
        }).ToList()];
        traderData.Assort.LoyalLevelItems[offerId] = barter.TraderLoyaltyLevel;

        logger.Info($"[{ModName}] Added '{barterName}' from config/barters.json.");
        return true;
    }

    private static List<string> Validate(BarterConfig barter)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(barter.Id))
        {
            errors.Add("item id cannot be empty");
        }

        if (string.IsNullOrWhiteSpace(barter.Trader))
        {
            errors.Add("trader cannot be empty");
        }

        if (barter.TraderLoyaltyLevel < 1)
        {
            errors.Add("trader loyalty level must be 1 or higher");
        }

        if (barter.StockAmount < 1)
        {
            errors.Add("stock amount must be 1 or higher");
        }

        if (barter.Barter.Count == 0)
        {
            errors.Add("barter items must contain at least one entry");
            return errors;
        }

        for (var index = 0; index < barter.Barter.Count; index++)
        {
            var requirement = barter.Barter[index];
            if (requirement.Count <= 0)
            {
                errors.Add($"barter item {index + 1} quantity must be greater than 0");
            }

            if (string.IsNullOrWhiteSpace(requirement.TemplateId))
            {
                errors.Add($"barter item {index + 1} id cannot be empty");
            }
        }

        return errors;
    }
}

public sealed record BarterConfig
{
    [JsonPropertyName("id")]
    public string Id { get; init; } = string.Empty;

    [JsonPropertyName("trader")]
    public string Trader { get; init; } = string.Empty;

    [JsonPropertyName("trader_loyalty_level")]
    public int TraderLoyaltyLevel { get; init; }

    [JsonPropertyName("unlimited_stock")]
    public bool UnlimitedStock { get; init; }

    [JsonPropertyName("stock_amount")]
    public int StockAmount { get; init; }

    [JsonPropertyName("barter")]
    public List<BarterRequirement> Barter { get; init; } = [];
}

public sealed record BarterRequirement
{
    [JsonPropertyName("count")]
    public int Count { get; init; }

    [JsonPropertyName("_tpl")]
    public string TemplateId { get; init; } = string.Empty;
}
