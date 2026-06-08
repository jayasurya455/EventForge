using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventForge.Hybrid.DTOs
{
    public sealed class PlayerDto
    {
        public Guid PlayerId { get; set; }

        public string Name { get; set; } = default!;
        public string? Email { get; set; }
        public string Role { get; set; } = default!;
        public decimal BasePrice { get; set; }

        public string? Area { get; set; }
        public string? PhotoPath { get; set; }

        public long Version { get; set; }

        public string CreatedAt { get; set; } = default!;
        public string UpdatedAt { get; set; } = default!;
    }
}
