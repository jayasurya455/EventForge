using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventForge.Infrastructure.FileStore
{
    public sealed class FileStorage
    {
        private readonly string _root;

        public FileStorage(string appDataRoot)
        {
            _root = appDataRoot;
        }

        public async Task<string> SaveImageAsync(
            AssetCategory category,
            Guid entityId,
            string sourceFilePath)
        {
            if (string.IsNullOrWhiteSpace(sourceFilePath))
                throw new ArgumentException("Source file path is required");

            if (!File.Exists(sourceFilePath))
                throw new FileNotFoundException(
                    "Source file not found",
                    sourceFilePath);

            var ext = Path.GetExtension(sourceFilePath);

            var categoryFolder = category.ToString().ToLowerInvariant() + "s";
            var imagesRoot = Path.Combine(_root, "images", categoryFolder);

            Directory.CreateDirectory(imagesRoot);

            var fileName = $"{entityId}{ext}";
            var targetPath = Path.Combine(imagesRoot, fileName);

            await using var source = File.OpenRead(sourceFilePath);
            await using var target = File.Create(targetPath);

            await source.CopyToAsync(target);

            // Always return RELATIVE path
            return $"images/{categoryFolder}/{fileName}";
        }

        public void DeleteImage(string? relativePath)
        {
            if (string.IsNullOrWhiteSpace(relativePath))
                return;

            var fullPath = Path.Combine(_root, relativePath);

            if (File.Exists(fullPath))
                File.Delete(fullPath);
        }
    }

}
