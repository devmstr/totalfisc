using System;
using System.IO;
using System.Windows;
using Microsoft.Web.WebView2.Core;

namespace TotalFisc.Desktop;

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        InitializeWebView();
    }

    private async void InitializeWebView()
    {
        try
        {
            // Wait for CoreWebView2 to be ready
            await webView.EnsureCoreWebView2Async(null);

            // Determine environment (Dev vs Prod)
#if DEBUG
            const string url = "http://localhost:5173";
#else
            // In Production, point to the build output folder
            string prodPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot", "index.html");
            string url = File.Exists(prodPath) ? $"file://{prodPath}" : "http://localhost:5000"; // Fallback to API if folder missing
#endif

            webView.CoreWebView2.Navigate(url);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"WebView2 failed to initialize: {ex.Message}", "Initialization Error", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }
}