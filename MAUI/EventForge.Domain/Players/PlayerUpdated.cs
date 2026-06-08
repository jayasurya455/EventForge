using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventForge.Domain.Players
{
    public sealed record PlayerUpdated(
        Guid PlayerId,
        string Name,
        string? PhotoPath
    );
}
