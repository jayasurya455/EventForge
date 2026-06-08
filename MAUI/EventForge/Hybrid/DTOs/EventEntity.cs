namespace EventForge.Hybrid.DTOs
{
    public sealed class EventEntity
    {
        public Guid EventId { get; set; }
        public Guid AggregateId { get; set; }
        public string AggregateType { get; set; } = default!;
        public string EventType { get; set; } = default!;
        public string PayloadJson { get; set; } = default!;
        public long EventNumber { get; set; }
        public DateTimeOffset OccurredAtUtc { get; set; }
    }
}
