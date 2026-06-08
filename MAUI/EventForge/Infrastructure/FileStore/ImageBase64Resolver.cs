using System.Collections.Concurrent;

namespace EventForge.Infrastructure.FileStore
{
    public sealed class ImageBase64Resolver
    {
        private readonly string _root;
        private readonly ConcurrentDictionary<string, string> _cache = new();

        public ImageBase64Resolver(string appDataRoot)
        {
            _root = appDataRoot;
        }

        public Task<string?> Resolve(string? logoPath, bool relativePath = true)
        {
            if (string.IsNullOrWhiteSpace(logoPath))
                return Task.FromResult<string?>(null);

            var fullPath = relativePath
                ? Path.Combine(_root, logoPath)
                : logoPath;

            if (!File.Exists(fullPath))
                return Task.FromResult<string?>(null);

            var lastWrite = File.GetLastWriteTimeUtc(fullPath).Ticks;

            // 🔴 VERSIONED CACHE KEY
            var cacheKey = $"{logoPath}::{lastWrite}";

            var value = _cache.GetOrAdd(cacheKey, _ =>
            {
                var bytes = File.ReadAllBytes(fullPath);
                var base64 = Convert.ToBase64String(bytes);
                var mime = GetMimeType(Path.GetExtension(fullPath));

                return $"data:{mime};base64,{base64}";
            });

            return Task.FromResult<string?>(value);
        }

        private static string GetMimeType(string ext)
        {
            return ext.ToLowerInvariant() switch
            {
                ".png" => "image/png",
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".webp" => "image/webp",
                _ => "image/png"
            };
        }
    }
}
