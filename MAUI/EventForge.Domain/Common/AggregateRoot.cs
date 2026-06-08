namespace EventForge.Domain.Common;

public abstract class AggregateRoot
{
    private readonly List<IDomainEvent> _uncommittedEvents = new();

    public Guid Id { get; protected set; }

    public IReadOnlyCollection<IDomainEvent> UncommittedEvents
        => _uncommittedEvents.AsReadOnly();

    protected void Raise(IDomainEvent @event)
    {
        Apply(@event);
        _uncommittedEvents.Add(@event);
    }

    public void LoadFromHistory(IEnumerable<IDomainEvent> history)
    {
        foreach (var @event in history)
        {
            Apply(@event);
        }
    }

    protected abstract void Apply(IDomainEvent @event);

    public void ClearUncommittedEvents()
        => _uncommittedEvents.Clear();
}
