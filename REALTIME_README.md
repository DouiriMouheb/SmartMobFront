# Real-time Acquisizioni Monitoring

This document describes the real-time monitoring system for quality control acquisitions using SignalR and React.

## Features

- **Real-time data updates** via SignalR WebSocket connection
- **Automatic reconnection** with exponential backoff
- **Connection status monitoring** with visual indicators
- **Manual reconnection** capability
- **Data fetching** from REST API as fallback
- **Toast notifications** for status updates
- **Detailed record view** with modal
- **Responsive UI** with Tailwind CSS

## Components

### 1. `useAcquisizioniRealtime` Hook

A custom React hook that manages the SignalR connection and real-time data.

#### Features:
- Automatic connection to SignalR hub
- Real-time event handling
- Connection state management
- Automatic reconnection with exponential backoff
- Initial data fetching from REST API
- Error handling and notifications

#### Usage:
```javascript
import useAcquisizioniRealtime from '../hooks/useAcquisizioniRealtime';

const MyComponent = () => {
  const {
    connectionState,
    isConnected,
    acquisizioni,
    recordCount,
    reconnect,
    refreshData,
    error
  } = useAcquisizioniRealtime();
  
  // Use the data and connection state in your component
};
```

#### Returned Properties:
- `connection`: SignalR connection instance
- `connectionState`: Current connection state ('Connected', 'Connecting', 'Reconnecting', 'Disconnected')
- `connectionId`: Unique connection identifier from server
- `isLoading`: Loading state for data operations
- `error`: Current error message (if any)
- `acquisizioni`: Array of acquisition records
- `lastUpdated`: Timestamp of last data update
- `recordCount`: Number of records
- `connect()`: Function to establish connection
- `disconnect()`: Function to close connection
- `reconnect()`: Function to manually reconnect
- `sendMessage()`: Function to send messages to hub
- `refreshData()`: Function to refresh data from REST API
- `isConnected`, `isConnecting`, `isReconnecting`, `isDisconnected`: Boolean status helpers

### 2. `RealtimeControlloQualita` Component

Main React component that displays the real-time monitoring interface.

#### Features:
- Connection status indicator with visual feedback
- Real-time data table with acquisitions
- Record count and last update timestamp
- Manual reconnection button
- Detailed record modal view
- Export capabilities (future enhancement)
- Responsive design

#### Data Table Columns:
- ID: Unique acquisition identifier
- Linea: Production line code
- Articolo: Article code
- Ordine: Order code  
- CQ Articolo: Quality control result for article
- CQ Box: Quality control result for box
- Foto: Available photos indicator
- Data Creazione: Creation timestamp

### 3. `acquisizioniService`

Service class for API communication.

#### Methods:
- `getLatestAcquisizioni()`: Fetch latest acquisitions
- `getAcquisizioneById(id)`: Fetch specific acquisition
- `getAcquisizioni(page, pageSize)`: Fetch paginated acquisitions
- `getAcquisizioniByDateRange(start, end)`: Fetch by date range
- `exportAcquisizioni(format)`: Export data
- `healthCheck()`: Check API health
- `validateSignalRConnection()`: Check SignalR hub availability

## API Configuration

### SignalR Hub
- **URL**: `https://localhost:5001/hubs/acquisizioni`
- **Events Handled**:
  - `Connected`: Receives connection ID
  - `AcquisizioniUpdated`: Receives array of updated acquisitions
  - `Error`: Receives error messages

### REST API
- **Base URL**: `https://localhost:5001`
- **Endpoints**:
  - `GET /api/acquisizioni/latest`: Get latest acquisitions
  - `GET /api/acquisizioni/{id}`: Get specific acquisition
  - `GET /api/acquisizioni`: Get paginated acquisitions
  - `GET /api/acquisizioni/range`: Get acquisitions by date range
  - `GET /api/health`: Health check
  - `GET /api/signalr/status`: SignalR status

## Data Model

### AcquisizioneDto
```javascript
{
  ID: number,                           // Unique identifier
  COD_LINEA: string,                   // Production line code
  FOTO_SUPERIORE?: string,             // Top photo path
  FOTO_FRONTALE?: string,              // Front photo path  
  FOTO_BOX?: string,                   // Box photo path
  CODICE_ARTICOLO?: string,            // Article code
  CODICE_ORDINE?: string,              // Order code
  ABILITA_CQ?: string,                 // Quality control enabled flag
  ESITO_CQ_ARTICOLO?: string,          // Quality control result for article
  SCOSTAMENTO_CQ_ARTICOLO?: string,    // Quality control deviation for article
  ESITO_CQ_BOX?: string,               // Quality control result for box
  CONFIDENZA_C?: string,               // Confidence level
  DT_INS?: string,                     // Insert date
  DT_AGG?: string,                     // Update date
  CreatedAt: string,                   // Creation timestamp
  UpdatedAt?: string                   // Last update timestamp
}
```

## Connection States

- **Connected**: Successfully connected to SignalR hub
- **Connecting**: Attempting initial connection
- **Reconnecting**: Attempting to reconnect after disconnection
- **Disconnected**: No active connection

## Error Handling

- **Network errors**: Automatic retry with exponential backoff
- **API errors**: Error messages displayed to user
- **SignalR errors**: Connection state updates and retry attempts
- **Toast notifications**: Success/error feedback to user

## Navigation

The real-time monitoring page is accessible via:
- Sidebar navigation: "Real-time Controllo"
- URL: `/realtime-controllo`

## Dependencies

- `@microsoft/signalr`: SignalR client library
- `react-hot-toast`: Toast notifications
- `lucide-react`: Icons
- `react-router-dom`: Routing

## Development Notes

1. **HTTPS**: Ensure the API is running on HTTPS for SignalR WebSocket connections
2. **CORS**: Configure CORS policy on the API server for the React app domain
3. **Authentication**: Add authentication headers to API calls if required
4. **Reconnection**: The hook implements automatic reconnection with exponential backoff
5. **Error Boundaries**: Consider adding React error boundaries for production use

## Future Enhancements

- [ ] Data filtering and search
- [ ] Export functionality
- [ ] Real-time charts and statistics
- [ ] Push notifications
- [ ] Offline mode with data synchronization
- [ ] Performance optimizations for large datasets
- [ ] Unit and integration tests
