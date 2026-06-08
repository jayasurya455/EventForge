using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventForge.Core.Events
{
    public sealed class DomainEvent
    {
        public string EventId { get; init; } = Guid.NewGuid().ToString();
        public string AggregateId { get; init; } = default!;
        public string Type { get; init; } = default!;
        public int Version { get; init; }
        public DateTime TimestampUtc { get; init; } = DateTime.UtcNow;
        public string DeviceId { get; init; } = Environment.MachineName;
        public object Payload { get; init; } = default!;
    }

}
