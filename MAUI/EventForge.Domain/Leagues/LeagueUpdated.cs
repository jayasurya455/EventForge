using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventForge.Domain.Leagues
{
    public sealed record LeagueUpdated(
    Guid LeagueId,
    string Name,
    int MaxTeams,
    decimal BudgetPerTeam
);

}
