using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventForge.Hybrid.Commands.Teams
{
    public sealed record GetTeamsByLeagueQuery(Guid LeagueId);
}
