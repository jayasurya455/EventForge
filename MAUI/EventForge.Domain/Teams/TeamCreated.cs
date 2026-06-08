using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventForge.Domain.Teams
{
    public sealed record TeamCreated(
        Guid TeamId,
        string Name,
        string? ShortName,
        string? LogoPath
    );

}
