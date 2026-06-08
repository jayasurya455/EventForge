using EventForge.Infrastructure.Persistence;

namespace EventForge;

public partial class App : Application
{
    // 🔴 SET BY MauiProgram
    public static string AppDataRoot { get; set; } = string.Empty;

    public App(EventForgeDbContext db)
    {
        InitializeComponent();
        db.Database.EnsureCreated();
        MainPage = new MainPage();
    }
}
