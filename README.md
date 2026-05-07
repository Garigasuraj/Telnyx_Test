# Telnyx Media Streaming Application

This application demonstrates how to use Telnyx's media streaming over WebSockets to make calls and receive real-time media with metadata.

## Features

- **Call Management**: Make outbound calls using Telnyx Call Control API
- **Media Streaming**: Stream call audio in real-time over WebSockets (PCMU codec, 8kHz)
- **Bidirectional Streaming**: Send and receive audio during active calls
- **Webhook Server**: Handle Telnyx call events
- **Metadata Collection**: Capture call information and stream metadata
- **Mark Tracking**: Track media completion using mark messages
- **DTMF Handling**: Capture DTMF (dial tone) events from inbound calls

## Setup

### Prerequisites

- Node.js 18+
- A Telnyx account with an API key
- A purchased Telnyx phone number
- A WebSocket server endpoint (can be ngrok/tunneling service for local development)

### Environment Variables

Create a `.env` file in the root directory:

```env
# Telnyx API Configuration
TELNYX_API_KEY=your_api_key_here
TELNYX_PHONE_NUMBER=+your_telnyx_number
TELNYX_CONNECTION_ID=your_connection_id

# Server Configuration
WEBHOOK_URL=https://yourdomain.com/webhooks
WEBSOCKET_SERVER_URL=wss://yourdomain.com/media
LOCAL_PORT=3000
WEBHOOK_PORT=3001
```

### Installation

```bash
npm install
```

## Usage

### Starting the Webhook Server

```bash
npm run webhook-server
```

This starts an Express server on port 3001 that receives Telnyx webhook events.

### Making an Outbound Call

```bash
npm run test:call
```

Or programmatically:

```javascript
import { makeCall } from './src/callManager.js';

const result = await makeCall({
  to: '+18005551234',
  from: '+your_telnyx_number',
  connectionId: 'your_connection_id',
  streamUrl: 'wss://yourdomain.com/media',
  streamTrack: 'both_tracks',
  bidirectionalMode: 'rtp',
  codec: 'PCMU'
});
```

### Starting Media Streaming Server

```bash
npm start
```

This starts the WebSocket server that receives media streams from Telnyx.

## API Endpoints

### Webhook Endpoints

- `POST /webhooks/call/initiated` - Handles call.initiated events
- `POST /webhooks/call/answered` - Handles call.answered events
- `POST /webhooks/call/machine_detection_ended` - Handles machine detection
- `POST /webhooks/call/ended` - Handles call.ended events
- `POST /webhooks/streaming/started` - Handles streaming.started events
- `POST /webhooks/streaming/stopped` - Handles streaming.stopped events

### WebSocket Events

#### Received from Telnyx

- `start` - Stream has started with media format info
- `media` - Audio media chunk (base64 encoded RTP payload)
- `dtmf` - DTMF digit received
- `mark` - Mark message for tracking media completion
- `stop` - Stream has stopped
- `error` - Error occurred on the stream

#### Send to Telnyx

- `media` - Send RTP audio stream (base64 encoded)
- `mark` - Send mark to track media completion
- `clear` - Clear media queue

## Event Flow

1. **Call Initiated**: Call is placed using Call Control API with stream_url and stream_track
2. **Call Connected**: Webhook receives `call.initiated` event
3. **WebSocket Connection**: Telnyx connects to WebSocket server with stream metadata
4. **Stream Started**: `start` event received with media format (PCMU, 8kHz, mono)
5. **Media Exchange**: Audio chunks received as `media` events (base64 encoded)
6. **DTMF Events**: Any dial tones captured as `dtmf` events
7. **Mark Tracking**: Send marks to track when media finishes playing
8. **Stream Stopped**: `stop` event when call ends
9. **Webhook Notification**: `streaming.stopped` webhook confirms stream end

## Media Format

- **Codec**: PCMU (u-law) - 8kHz by default
- **Sample Rate**: 8000 Hz
- **Channels**: 1 (mono)
- **Payload**: Base64-encoded RTP payload (without RTP headers)
- **Chunk Duration**: 20ms - 30 seconds

## Metadata Captured

Each stream provides:
- `stream_id`: Unique stream identifier
- `call_control_id`: Call identifier for API operations
- `call_session_id`: Session identifier
- `from`: Caller's phone number
- `to`: Called party's phone number
- `tags`: Custom tags (if provided)
- `user_id`: User identifier
- `client_state`: Custom client state (base64 encoded)

## Testing

Run the test suite:

```bash
npm test
```

Run a specific call test:

```bash
npm run test:call
```

## Examples

See the `src/examples/` directory for:
- Simple media streaming example
- DeepGram transcription integration
- OpenAI speech-to-speech integration

## Troubleshooting

### WebSocket Connection Refused
- Ensure your `WEBSOCKET_SERVER_URL` is publicly accessible
- Check that your tunneling service (ngrok) is running
- Verify firewall allows WebSocket connections (port 443 for WSS)

### No Audio Received
- Confirm `stream_track` is set correctly (`inbound_track`, `outbound_track`, or `both_tracks`)
- Check that Telnyx can connect to your WebSocket server
- Verify the `connection_id` and `TELNYX_API_KEY` are valid

### Bidirectional Streaming Issues
- Ensure codec matches between request and RTP payload
- Limit to one bidirectional stream per call
- Audio chunks should be 20ms - 30 seconds

## References

- [Telnyx Media Streaming Documentation](https://developers.telnyx.com/docs/api/media-streaming)
- [Telnyx Call Control API](https://developers.telnyx.com/docs/api/call-control)
- [WebSocket Protocol](https://tools.ietf.org/html/rfc6455)

## License

MIT
