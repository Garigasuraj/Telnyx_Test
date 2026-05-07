import WebSocket from 'ws';

/**
 * Media Stream Handler for managing WebSocket connections to Telnyx
 */
export class MediaStreamHandler {
  constructor() {
    this.streams = new Map(); // stream_id -> stream metadata
    this.mediaQueue = new Map(); // stream_id -> queued media
    this.marks = new Map(); // stream_id -> pending marks
    this.dtmfBuffer = new Map(); // stream_id -> DTMF digits
  }

  /**
   * Connect to Telnyx media stream and handle incoming events
   * @param {string} streamUrl - WebSocket URL from Telnyx
   * @param {Object} options - Configuration option
   * @returns {Promise<WebSocket>}
   */
  connectToStream(streamUrl, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(streamUrl);

        ws.on('open', () => {
          console.log('✅ Connected to Telnyx media stream');
          resolve(ws);
        });

        ws.on('message', (data) => {
          this.handleStreamMessage(ws, data, options);
        });

        ws.on('error', (error) => {
          console.error('❌ WebSocket error:', error.message);
          reject(error);
        });

        ws.on('close', () => {
          console.log('❌ Disconnected from Telnyx media stream');
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages from Telnyx
   * @param {WebSocket} ws - WebSocket connection
   * @param {Buffer} data - Message data
   * @param {Object} options - Options for handlers
   */
  handleStreamMessage(ws, data, options = {}) {
    try {
      const message = JSON.parse(data.toString());

      const {
        onStart = null,
        onMedia = null,
        onDtmf = null,
        onMark = null,
        onStop = null,
        onError = null
      } = options;

      switch (message.event) {
        case 'connected':
          console.log('📡 Telnyx stream connected:', message);
          break;

        case 'start':
          console.log('🎬 Stream started:', message.start);
          this.stores(message.stream_id, message.start);
          if (onStart) onStart(message);
          break;

        case 'media':
          console.log(`🔊 Media received [${message.sequence_number}]:`, {
            streamId: message.stream_id,
            track: message.media?.track,
            chunkNumber: message.media?.chunk,
            timestamp: message.media?.timestamp,
            payloadSize: message.media?.payload?.length || 0
          });
          if (onMedia) onMedia(message);
          break;

        case 'dtmf':
          console.log('📳 DTMF received:', message.dtmf?.digit);
          this.recordDtmf(message.stream_id, message.dtmf?.digit);
          if (onDtmf) onDtmf(message);
          break;

        case 'mark':
          console.log('✔️ Mark received:', message.mark?.name);
          if (onMark) onMark(message);
          break;

        case 'stop':
          console.log('⏹️ Stream stopped:', message.stop);
          this.clearStreamData(message.stream_id);
          if (onStop) onStop(message);
          break;

        case 'error':
          console.error('⚠️ Stream error:', message.payload);
          if (onError) onError(message);
          break;

        default:
          console.warn('⚠️ Unknown event:', message.event);
      }
    } catch (error) {
      console.error('❌ Error processing stream message:', error.message);
    }
  }

  /**
   * Send media to the stream (RTP audio or MP3)
   * @param {WebSocket} ws - WebSocket connection
   * @param {Buffer} audioData - Audio data (raw RTP or MP3 encoded as base64)
   */
  sendMedia(ws, audioData) {
    try {
      const payload = typeof audioData === 'string'
        ? audioData
        : audioData.toString('base64');

      const message = {
        event: 'media',
        media: {
          payload: payload
        }
      };

      ws.send(JSON.stringify(message));
      console.log('📤 Media sent, payload size:', payload.length);
    } catch (error) {
      console.error('❌ Error sending media:', error.message);
    }
  }

  /**
   * Send a mark message to track media completion
   * @param {WebSocket} ws - WebSocket connection
   * @param {string} markName - Name of the mark
   */
  sendMark(ws, markName) {
    try {
      const message = {
        event: 'mark',
        mark: {
          name: markName
        }
      };

      ws.send(JSON.stringify(message));
      console.log('📍 Mark sent:', markName);
    } catch (error) {
      console.error('❌ Error sending mark:', error.message);
    }
  }

  /**
   * Clear the media queue
   * @param {WebSocket} ws - WebSocket connection
   */
  clearQueue(ws) {
    try {
      const message = { event: 'clear' };
      ws.send(JSON.stringify(message));
      console.log('🗑️ Media queue cleared');
    } catch (error) {
      console.error('❌ Error clearing queue:', error.message);
    }
  }

  /**
   * Store stream metadata
   * @param {string} streamId - Stream ID
   * @param {Object} startData - Start event data
   */
  stores(streamId, startData) {
    this.streams.set(streamId, {
      ...startData,
      startTime: new Date(),
      receivedMediaChunks: 0,
      receivedDtmfDigits: []
    });
  }

  /**
   * Record DTMF digit for a stream
   * @param {string} streamId - Stream ID
   * @param {string} digit - DTMF digit
   */
  recordDtmf(streamId, digit) {
    const streamData = this.streams.get(streamId);
    if (streamData) {
      streamData.receivedDtmfDigits.push(digit);
    }
  }

  /**
   * Get stream metadata
   * @param {string} streamId - Stream ID
   * @returns {Object} Stream metadata
   */
  getStreamData(streamId) {
    return this.streams.get(streamId);
  }

  /**
   * Get all active streams
   * @returns {Map} Map of all streams
   */
  getAllStreams() {
    return this.streams;
  }

  /**
   * Clear stream data when stream ends
   * @param {string} streamId - Stream ID
   */
  clearStreamData(streamId) {
    this.streams.delete(streamId);
    this.mediaQueue.delete(streamId);
    this.marks.delete(streamId);
    this.dtmfBuffer.delete(streamId);
  }

  /**
   * Get DTMF digits collected for a stream
   * @param {string} streamId - Stream ID
   * @returns {string} DTMF digits
   */
  getDtmfDigits(streamId) {
    const streamData = this.streams.get(streamId);
    return streamData ? streamData.receivedDtmfDigits.join('') : '';
  }

  /**
   * Get statistics for a stream
   * @param {string} streamId - Stream ID
   * @returns {Object} Stream statistics
   */
  getStreamStats(streamId) {
    const streamData = this.streams.get(streamId);
    if (!streamData) return null;

    return {
      streamId,
      duration: new Date() - streamData.startTime,
      callControlId: streamData.call_control_id,
      from: streamData.from,
      to: streamData.to,
      mediaFormat: streamData.media_format,
      dtmfDigits: streamData.receivedDtmfDigits.join(''),
      mediaChunksReceived: streamData.receivedMediaChunks
    };
  }
}

export default MediaStreamHandler;
