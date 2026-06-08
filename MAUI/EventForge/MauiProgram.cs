using EventForge.Hybrid.Handlers.Leagues;
using EventForge.Hybrid.Handlers.Players;
using EventForge.Hybrid.Handlers.Teams;
using EventForge.Hybrid.Handlers.Auctions;
using EventForge.Hybrid.Mappers;
using EventForge.Infrastructure;
using EventForge.Infrastructure.FileStore;
using EventForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using SQLitePCL;

namespace EventForge;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        Batteries.Init();

        // 🔴 SINGLE STORAGE ROOT (LOCKED)
        App.AppDataRoot = Path.Combine(
            FileSystem.AppDataDirectory,
            "EventForgeData"
        );
        Directory.CreateDirectory(App.AppDataRoot);

        var builder = MauiApp.CreateBuilder();

        builder.UseMauiApp<App>();

        // -----------------------------
        // SQLITE READ MODEL (CACHE)
        // -----------------------------
        var dbPath = Path.Combine(App.AppDataRoot, "eventforge.db");

        builder.Services.AddDbContext<EventForgeDbContext>(options =>
        {
            options.UseSqlite($"Data Source={dbPath}");
        });

        builder.Services.AddScoped<SqliteEventStore>();
        builder.Services.AddScoped<HybridFilePicker>();
        builder.Services.AddSingleton(new FileStorage(App.AppDataRoot));
        builder.Services.AddSingleton(new ImageBase64Resolver(App.AppDataRoot));

        //Mappers
        builder.Services.AddSingleton<LeagueMapper>();
        builder.Services.AddSingleton<TeamMapper>();
        builder.Services.AddSingleton<PlayerMapper>();

        // -----------------------------
        // QUERY + COMMAND HANDLERS
        // -----------------------------
        builder.Services.AddScoped<GetLeagueHandler>();
        builder.Services.AddScoped<CreateLeagueCommandHandler>();
        builder.Services.AddScoped<UpdateLeagueCommandHandler>();
        builder.Services.AddScoped<DeleteLeagueCommandHandler>();
        builder.Services.AddScoped<TeamCommandHandler>();
        builder.Services.AddScoped<PlayerCommandHandler>();
        builder.Services.AddScoped<AuctionCommandHandler>();

        var app = builder.Build();

        // 🔴 Bridge init AFTER DI + Build
        HybridBridge.Initialize(app.Services);

        return app;
    }
}
