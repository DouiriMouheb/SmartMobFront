# C# API Configuration for SignalR and CORS

To resolve the CORS and SignalR connection issues shown in the browser, you need to configure your C# API server properly.

## Required Configuration

### 1. Program.cs (or Startup.cs) Configuration

```csharp
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddSignalR();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000") // React dev server URLs
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Required for SignalR
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// IMPORTANT: Use CORS before routing
app.UseCors("AllowReactApp");

app.UseRouting();
app.UseAuthorization();

// Map controllers and SignalR hub
app.MapControllers();
app.MapHub<AcquisizioniHub>("/hubs/acquisizioni");

// Health check endpoint
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.Run();
```

### 2. SignalR Hub Implementation

Create a file `AcquisizioniHub.cs`:

```csharp
using Microsoft.AspNetCore.SignalR;

public class AcquisizioniHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        // Send connection ID to client
        await Clients.Caller.SendAsync("Connected", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        await base.OnDisconnectedAsync(exception);
    }

    // Method to send updates to all connected clients
    public async Task SendAcquisizioniUpdate(object[] acquisizioni)
    {
        await Clients.All.SendAsync("AcquisizioniUpdated", acquisizioni);
    }
}
```

### 3. Controller Example

Create `AcquisizioniController.cs`:

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

[ApiController]
[Route("api/[controller]")]
public class AcquisizioniController : ControllerBase
{
    private readonly IHubContext<AcquisizioniHub> _hubContext;

    public AcquisizioniController(IHubContext<AcquisizioniHub> hubContext)
    {
        _hubContext = hubContext;
    }

    [HttpGet("latest")]
    public async Task<IActionResult> GetLatestAcquisizioni()
    {
        // Your logic to get latest acquisizioni
        var acquisizioni = new[]
        {
            new {
                ID = 1,
                COD_LINEA = "LINE001",
                CODICE_ARTICOLO = "ART001",
                CODICE_ORDINE = "ORD001",
                ESITO_CQ_ARTICOLO = "OK",
                ESITO_CQ_BOX = "OK",
                CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            }
        };

        return Ok(acquisizioni);
    }

    [HttpPost("trigger-update")]
    public async Task<IActionResult> TriggerUpdate([FromBody] object[] acquisizioni)
    {
        // Send real-time update to all connected clients
        await _hubContext.Clients.All.SendAsync("AcquisizioniUpdated", acquisizioni);
        return Ok(new { message = "Update sent to all clients", count = acquisizioni.Length });
    }
}
```

### 4. Data Model (Optional)

```csharp
public class AcquisizioneDto
{
    public int ID { get; set; }
    public string COD_LINEA { get; set; }
    public string? FOTO_SUPERIORE { get; set; }
    public string? FOTO_FRONTALE { get; set; }
    public string? FOTO_BOX { get; set; }
    public string? CODICE_ARTICOLO { get; set; }
    public string? CODICE_ORDINE { get; set; }
    public string? ABILITA_CQ { get; set; }
    public string? ESITO_CQ_ARTICOLO { get; set; }
    public string? SCOSTAMENTO_CQ_ARTICOLO { get; set; }
    public string? ESITO_CQ_BOX { get; set; }
    public string? CONFIDENZA_C { get; set; }
    public string? DT_INS { get; set; }
    public string? DT_AGG { get; set; }
    public string CreatedAt { get; set; }
    public string? UpdatedAt { get; set; }
}
```

### 5. launchSettings.json

Make sure your API runs on the expected URL:

```json
{
  "profiles": {
    "Development": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": false,
      "applicationUrl": "https://localhost:7052;http://localhost:7051",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

## Key Points for CORS and SignalR

1. **CORS must be configured before UseRouting()**
2. **AllowCredentials() is required for SignalR**
3. **Include all possible React dev server URLs**
4. **Use HTTP for development to avoid SSL certificate issues**
5. **The hub endpoint must match exactly: `/hubs/acquisizioni`**

## Testing the Configuration

1. Start your C# API with: `dotnet run`
2. Verify it's running on `https://localhost:7052`
3. Test the endpoints:
   - `GET https://localhost:7052/api/health`
   - `GET https://localhost:7052/api/acquisizioni/latest`
4. Start the React app and verify the real-time connection works properly

## Common Issues and Solutions

### Issue: CORS Policy Error
**Solution**: Ensure CORS is configured properly and called before UseRouting()

### Issue: SignalR Negotiation Failed
**Solution**: Verify the hub is mapped correctly and CORS allows credentials

### Issue: Connection Timeout
**Solution**: Check if the API is running and accessible on port 7052

### Issue: SSL Certificate Error
**Solution**: Ensure you have a valid development certificate. Run `dotnet dev-certs https --trust` to trust the development certificate

## Production Considerations

For production deployment:
1. Use HTTPS with proper SSL certificates
2. Restrict CORS origins to your production domain
3. Implement proper authentication and authorization
4. Add logging and monitoring
5. Configure connection limits and timeouts appropriately
