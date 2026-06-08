using System.Text.Json;

namespace EventForge;

public partial class MainPage : ContentPage
{
    public MainPage()
    {
        InitializeComponent();

        AppWebView.Navigating += OnNavigating;

        AppWebView.Source = new UrlWebViewSource
        {
            Url = "wwwroot/browser/index.html"
        };
    }

    private async void OnNavigating(object? sender, WebNavigatingEventArgs e)
    {
        if (!e.Url.StartsWith("eventforge://"))
            return;

        e.Cancel = true;

        var uri = new Uri(e.Url);
        var query = System.Web.HttpUtility.ParseQueryString(uri.Query);

        var callId = query["callId"];
        var method = query["method"];
        var payloadJson = query["payload"];

        // 🔴 IMPORTANT: result MUST be valid JS expression
        string result;
        try
        {
            result = await NativeCommandRouter.RouteAsync(method, payloadJson);
        }
        catch (Exception ex)
        {
            result = JsonSerializer.Serialize(new
            {
                error = ex.Message
            });
        }

        // 🔴 DO NOT JsonSerialize again
        await AppWebView.EvaluateJavaScriptAsync(
            $"window.__eventForgeResolve({callId}, {result});"
        );
    }
}
