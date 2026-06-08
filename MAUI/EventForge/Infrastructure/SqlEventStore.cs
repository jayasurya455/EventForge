using EventForge.Hybrid.DTOs;
using EventForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace EventForge.Infrastructure
{
    public sealed class SqliteEventStore
    {
        private readonly EventForgeDbContext _db;

        public SqliteEventStore(EventForgeDbContext db)
        {
            _db = db;
        }

        public async Task<long> AppendAsync(
            Guid aggregateId,
            string aggregateType,
            object @event)
        {
            var last = await _db.Events
                .Where(e => e.AggregateId == aggregateId)
                .OrderByDescending(e => e.EventNumber)
                .Select(e => (long?)e.EventNumber)
                .FirstOrDefaultAsync() ?? 0;

            var entity = new EventEntity
            {
                EventId = Guid.NewGuid(),
                AggregateId = aggregateId,
                AggregateType = aggregateType,
                EventType = @event.GetType().Name,
                PayloadJson = JsonSerializer.Serialize(@event),
                EventNumber = last + 1,
                OccurredAtUtc = DateTimeOffset.UtcNow
            };

            _db.Events.Add(entity);
            return entity.EventNumber;
        }
    }

}
