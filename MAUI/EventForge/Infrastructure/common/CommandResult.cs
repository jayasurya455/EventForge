namespace EventForge.Infrastructure.common
{
    public sealed record CommandResult(
    bool Success,
    string? Message = null,
    object? Data = null)
    {
        public static CommandResult Ok(string? message = null, object? data = null)
            => new(true, message, data);

        public static CommandResult Fail(string message)
            => new(false, message);
    }
}
