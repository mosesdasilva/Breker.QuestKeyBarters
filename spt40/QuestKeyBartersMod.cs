using SPTarkov.DI.Annotations;
using SPTarkov.Server.Core.DI;
using SPTarkov.Server.Core.Models.Utils;

namespace QuestKeyBarters.Spt40;

[Injectable(TypePriority = OnLoadOrder.PostDBModLoader + 1)]
public sealed class QuestKeyBartersMod(ISptLogger<QuestKeyBartersMod> logger) : IOnLoad
{
    public Task OnLoad()
    {
        logger.Success("[Breker's Quest Key Barters] SPT 4 loader milestone reached.");
        return Task.CompletedTask;
    }
}
