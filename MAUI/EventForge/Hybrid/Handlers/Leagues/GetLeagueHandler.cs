using EventForge.Domain.Leagues;
using EventForge.Hybrid.Mappers;
using EventForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EventForge.Hybrid.Handlers.Leagues;

public sealed class GetLeagueHandler
{
    private readonly EventForgeDbContext _db;
    private readonly LeagueMapper _mapper;

    public GetLeagueHandler(EventForgeDbContext db, LeagueMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<League>> GetAllAsync()
    {
        var result = await _db.Leagues.OrderBy(x => x.Name).ToListAsync();
        return result.Select(x => _mapper.ToDomain(x)).ToList();
    }

    public async Task<League> GetIdAsync(Guid Id)
    {
        var result = await _db.Leagues.Where(x => x.LeagueId == Id).FirstOrDefaultAsync();
        return _mapper.ToDomain(result);
    }
}

