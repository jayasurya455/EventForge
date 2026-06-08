using EventForge.Domain.Leagues;
using EventForge.Hybrid.Commands.Leagues;
using EventForge.Infrastructure.FileStore;
using Microsoft.Maui.Storage;
using System.Text.Json;

namespace EventForge;

public class HybridFilePicker
{
    private readonly FileStorage _fileStorage;

    public HybridFilePicker(FileStorage fileStorage)
    { 
        _fileStorage = fileStorage;
    }

    public async Task<string> PickImageAsync()
    {
        var imageId = Guid.NewGuid();
        var result = await FilePicker.Default.PickAsync(
            new PickOptions
            {
                PickerTitle = "Select Image",
                FileTypes = FilePickerFileType.Images
            });

        if (result == null)
            return "null";

        var fullPath = result.FullPath.Replace("\\", "/");

        // IMPORTANT: FullPath is what we need
        return fullPath;
    }

    public async Task<bool> DeleteImageAsync(string logoPath)
    {
        _fileStorage.DeleteImage(logoPath);
        return true;
    }
}
