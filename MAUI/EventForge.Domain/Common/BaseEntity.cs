
namespace EventForge.Domain.Common
{
    public abstract class BaseEntity
    {
        public Guid id { get; set; }

        public DateTime createdAt { get; set; }

        public DateTime updatedAt { get; set; }
    }
}
