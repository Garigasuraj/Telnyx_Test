import axios from 'axios';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const API_BASE_URL = 'https://api.telnyx.com/v2';
const API_KEY = process.env.TELNYX_API_KEY;

if (!API_KEY) {
  throw new Error('TELNYX_API_KEY environment variable is required');
}

/**
 * CallManager - Manages Telnyx API calls
 */
class CallManager {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    this.activeCalls = new Map();
    this.connectionId = process.env.TELNYX_CONNECTION_ID;
    this.fromNumber = process.env.TELNYX_PHONE_NUMBER;
  }

  /**
   * Make an outbound call with media streaming
   */
  async makeCall(options) {
    try {
      const {
        to,
        from = this.fromNumber,
        connectionId = this.connectionId,
        streamUrl,
        streamTrack = 'both_tracks',
        bidirectionalMode = 'rtp',
        codec = 'PCMU',
        tags = [],
        clientState = null
      } = options;

      const callId = uuidv4();

      const payload = {
        connection_id: connectionId,
        to,
        from,
        stream_url: streamUrl,
        stream_track: streamTrack,
        stream_bidirectional_mode: bidirectionalMode,
        stream_bidirectional_codec: codec
      };

      if (tags.length > 0) {
        payload.tags = tags;
      }

      if (clientState) {
        payload.client_state = clientState;
      }

      console.log('📞 Making call with payload:', JSON.stringify(payload, null, 2));

      const response = await this.apiClient.post('/calls', payload);

      const callData = {
        callId,
        controlId: response.data.data.call_control_id,
        legId: response.data.data.call_leg_id,
        sessionId: response.data.data.call_session_id,
        to,
        from,
        status: 'initiated',
        startTime: new Date(),
        streamUrl,
        recordingUrl: null,
        metadata: response.data.data,
        mediaData: {
          chunks: [],
          dtmfEvents: [],
          marks: []
        }
      };

      this.activeCalls.set(callId, callData);

      console.log('✅ Call created successfully');
      console.log('Call ID:', response.data.data.call_control_id);
      console.log('Call Leg ID:', response.data.data.call_leg_id);

      return callData;
    } catch (error) {
      console.error('❌ Error making call:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Answer an incoming call
   */
  async answerCall(callControlId, options = {}) {
    try {
      const {
        streamUrl,
        streamTrack = 'both_tracks',
        bidirectionalMode = 'rtp',
        codec = 'PCMU'
      } = options;

      const payload = {
        command_id: this.generateCommandId()
      };

      if (streamUrl) {
        payload.stream_url = streamUrl;
        payload.stream_track = streamTrack;
        payload.stream_bidirectional_mode = bidirectionalMode;
        payload.stream_bidirectional_codec = codec;
      }

      const response = await this.apiClient.post(
        `/calls/${callControlId}/actions/answer`,
        payload
      );

      // Update call status
      const call = Array.from(this.activeCalls.values()).find(c => c.controlId === callControlId);
      if (call) {
        call.status = 'answered';
        this.activeCalls.set(call.callId, call);
      }

      console.log('✅ Call answered successfully');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error answering call:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Reject an incoming call
   */
  async rejectCall(callControlId) {
    try {
      const response = await this.apiClient.post(
        `/calls/${callControlId}/actions/reject`,
        { command_id: this.generateCommandId() }
      );

      console.log('✅ Call rejected');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error rejecting call:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Hangup a call
   */
  async hangupCall(callControlId) {
    try {
      const response = await this.apiClient.post(
        `/calls/${callControlId}/actions/hangup`,
        { command_id: this.generateCommandId() }
      );

      // Update call status
      const call = Array.from(this.activeCalls.values()).find(c => c.controlId === callControlId);
      if (call) {
        call.status = 'completed';
        call.endTime = new Date();
        this.activeCalls.set(call.callId, call);
      }

      console.log('✅ Call hung up');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error hanging up call:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send DTMF digits
   */
  async sendDtmf(callControlId, digits) {
    try {
      const response = await this.apiClient.post(
        `/calls/${callControlId}/actions/send_dtmf`,
        {
          command_id: this.generateCommandId(),
          dtmf_digits: digits
        }
      );

      console.log('✅ DTMF sent:', digits);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error sending DTMF:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Start media streaming
   */
  async startStreaming(callControlId, streamUrl, options = {}) {
    try {
      const {
        streamTrack = 'both_tracks',
        bidirectionalMode = 'rtp',
        codec = 'PCMU'
      } = options;

      const response = await this.apiClient.post(
        `/calls/${callControlId}/actions/streaming_start`,
        {
          command_id: this.generateCommandId(),
          stream_url: streamUrl,
          stream_track: streamTrack,
          stream_bidirectional_mode: bidirectionalMode,
          stream_bidirectional_codec: codec
        }
      );

      console.log('✅ Streaming started');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error starting streaming:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Stop media streaming
   */
  async stopStreaming(callControlId) {
    try {
      const response = await this.apiClient.post(
        `/calls/${callControlId}/actions/streaming_stop`,
        { command_id: this.generateCommandId() }
      );

      console.log('✅ Streaming stopped');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error stopping streaming:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get call details
   */
  async getCall(callControlId) {
    try {
      const response = await this.apiClient.get(`/calls/${callControlId}`);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching call:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get active calls
   */
  getActiveCalls() {
    return Array.from(this.activeCalls.values());
  }

  /**
   * Get specific call info
   */
  getCallInfo(callId) {
    return this.activeCalls.get(callId);
  }

  /**
   * Update call status
   */
  updateCallStatus(callId, status, metadata = {}) {
    const call = this.activeCalls.get(callId);
    if (call) {
      call.status = status;
      call.metadata = { ...call.metadata, ...metadata };
      this.activeCalls.set(callId, call);
    }
  }

  /**
   * Remove call from active calls
   */
  removeCall(callId) {
    this.activeCalls.delete(callId);
  }

  /**
   * Generate unique command ID
   */
  generateCommandId() {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new CallManager();
