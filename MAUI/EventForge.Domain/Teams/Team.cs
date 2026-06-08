using EventForge.Domain.Common;

namespace EventForge.Domain.Teams
{
    public class Team : BaseEntity
    {
        public string name { get; set; } = string.Empty;
        public string? shortName { get; set; }
        public string? logoPath { get; set; }
        public string? logoImage { get; set; }
        public string? teamColor { get; set; }
        public long teamProvidedbudget { get; set; }
        public string? teamInitial { get; set; }
    }
}
