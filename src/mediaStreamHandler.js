export function initMediaStreamHandler(ws, req) {
  const clientId = `${req.socket.remoteAddress}:${req.socket.remotePort}`;

  console.log(`[MediaStream] Client connected: ${clientId}`);

  const streamMetadata = {
    clientId,
    connectedAt: new Date(),
    streams: new Map(),
    mediaChunks: [],
    dtmfEvents: [],
    marks: [],
    startTime: null,
    endTime: null
  };

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      handleStreamMessage(ws, message, streamMetadata);
    } catch (error) {
      console.error('[MediaStream] Error parsing message:', error);
    }
  });

  ws.on('error', (error) => {
    console.error('[MediaStream] Error:', error);
  });

  ws.on('close', () => {
    console.log(`[MediaStream] Client disconnected: ${clientId}`);
    streamMetadata.endTime = new Date();
  });
}

function handleStreamMessage(ws, message, streamMetadata) {
  switch (message.event) {
    case 'connected':
      console.log('[MediaStream] ✅ WebSocket connected');
      break;
    case 'start':
      console.log('[MediaStream] 🎙️ Media streaming started');
      streamMetadata.streams.set(message.stream_id, {
        streamId: message.stream_id,
        callControlId: message.start.call_control_id,
        from: message.start.from,
        to: message.start.to,
        mediaFormat: message.start.media_format,
        startedAt: new Date(),
        mediaChunks: []
      });
      break;
    case 'media':
      console.log('[MediaStream] 📦 Media chunk received');
      streamMetadata.mediaChunks.push({
        streamId: message.stream_id,
        track: message.media.track,
        chunk: message.media.chunk,
        timestamp: message.media.timestamp,
        receivedAt: new Date()
      });
      break;
    case 'dtmf':
      console.log('[MediaStream] ☎️ DTMF digit:', message.dtmf.digit);
      streamMetadata.dtmfEvents.push({
        streamId: message.stream_id,
        digit: message.dtmf.digit,
        occurredAt: message.occurred_at
      });
      break;
    case 'stop':
      console.log('[MediaStream] ⏹️ Media streaming stopped');
      break;
    case 'error':
      console.error('[MediaStream] ❌ Stream Error:', message.payload.title);
      break;
    default:
      console.log(`[MediaStream] Unknown event: ${message.event}`);
  }
}
