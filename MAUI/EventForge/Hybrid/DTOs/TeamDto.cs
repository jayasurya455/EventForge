using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventForge.Hybrid.DTOs
{
    public sealed class TeamDto
    {
        public Guid TeamId { get; set; }

        public string Name { get; set; } = default!;
        public string? ShortName { get; set; }
        public string? LogoPath { get; set; }
        public string? TeamColor { get; set; }
        public long TeamProvidedBudget { get; set; }

        public long Version { get; set; }

        public string CreatedAt { get; set; } = default!;
        public string UpdatedAt { get; set; } = default!;
    }

}
