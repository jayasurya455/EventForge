using EventForge.Domain.Common;

namespace EventForge.Domain.Players
{
    public class Player : BaseEntity
    {
        public string name { get; set; } = string.Empty;
        public string? email { get; set; }
        public string? imageBase { get; set; }
        public string? role { get; set; }

        public decimal basePrice { get; set; }

        public string? imagePath { get; set; }
        public string? initial {  get; set; }

        public string? area { get; set; }
    }
}
