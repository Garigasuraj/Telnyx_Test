import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'https://api.telnyx.com/v2';
const API_KEY = process.env.TELNYX_API_KEY;

if (!API_KEY) {
  throw new Error('TELNYX_API_KEY environment variable is required');
}

/**
 * Create an axios instance with Telnyx auth headers
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  }
});

/**
 * Make an outbound call with media streaming
 * @param {Object} options - Call options
 * @param {string} options.to - Destination phone number
 * @param {string} options.from - Source phone number
 * @param {string} options.connectionId - Telnyx connection ID
 * @param {string} options.streamUrl - WebSocket URL for media streaming
 * @param {string} options.streamTrack - 'inbound_track', 'outbound_track', or 'both_tracks'
 * @param {string} options.bidirectionalMode - 'rtp' for bidirectional streaming
 * @param {string} options.codec - Audio codec (PCMU, PCMA, G722, OPUS, AMR-WB, L16)
 * @returns {Promise<Object>} Call creation response
 */
export async function makeCall(options) {
  try {
    const {
      to,
      from,
      connectionId,
      streamUrl,
      streamTrack = 'both_tracks',
      bidirectionalMode = 'rtp',
      codec = 'PCMU',
      tags = [],
      clientState = null
    } = options;

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

    const response = await apiClient.post('/calls', payload);

    console.log('✅ Call created successfully');
    console.log('Call ID:', response.data.data.call_control_id);
    console.log('Call Leg ID:', response.data.data.call_leg_id);

    return response.data.data;
  } catch (error) {
    console.error('❌ Error making call:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Answer an incoming call
 * @param {string} callControlId - Call control ID
 * @param {string} streamUrl - WebSocket URL for streaming
 * @param {string} streamTrack - Track to stream
 * @param {string} bidirectionalMode - RTP mode for bidirectional
 * @param {string} codec - Audio codec
 * @returns {Promise<Object>} Answer response
 */
export async function answerCall(callControlId, {
  streamUrl,
  streamTrack = 'both_tracks',
  bidirectionalMode = 'rtp',
  codec = 'PCMU'
} = {}) {
  try {
    const payload = {
      command_id: generateCommandId()
    };

    if (streamUrl) {
      payload.stream_url = streamUrl;
      payload.stream_track = streamTrack;
      payload.stream_bidirectional_mode = bidirectionalMode;
      payload.stream_bidirectional_codec = codec;
    }

    const response = await apiClient.post(
      `/calls/${callControlId}/actions/answer`,
      payload
    );

    console.log('✅ Call answered successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ Error answering call:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Reject an incoming call
 * @param {string} callControlId - Call control ID
 * @returns {Promise<Object>} Reject response
 */
export async function rejectCall(callControlId) {
  try {
    const response = await apiClient.post(
      `/calls/${callControlId}/actions/reject`,
      { command_id: generateCommandId() }
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
 * @param {string} callControlId - Call control ID
 * @returns {Promise<Object>} Hangup response
 */
export async function hangupCall(callControlId) {
  try {
    const response = await apiClient.post(
      `/calls/${callControlId}/actions/hangup`,
      { command_id: generateCommandId() }
    );

    console.log('✅ Call hung up');
    return response.data.data;
  } catch (error) {
    console.error('❌ Error hanging up call:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Send DTMF digits
 * @param {string} callControlId - Call control ID
 * @param {string} digits - DTMF digits to send
 * @returns {Promise<Object>} DTMF response
 */
export async function sendDtmf(callControlId, digits) {
  try {
    const response = await apiClient.post(
      `/calls/${callControlId}/actions/send_dtmf`,
      {
        command_id: generateCommandId(),
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
 * Start a media streaming connection
 * @param {string} callControlId - Call control ID
 * @param {string} streamUrl - WebSocket URL
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Stream start response
 */
export async function startStreaming(callControlId, streamUrl, options = {}) {
  try {
    const {
      streamTrack = 'both_tracks',
      bidirectionalMode = 'rtp',
      codec = 'PCMU'
    } = options;

    const response = await apiClient.post(
      `/calls/${callControlId}/actions/streaming_start`,
      {
        command_id: generateCommandId(),
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
 * @param {string} callControlId - Call control ID
 * @returns {Promise<Object>} Stream stop response
 */
export async function stopStreaming(callControlId) {
  try {
    const response = await apiClient.post(
      `/calls/${callControlId}/actions/streaming_stop`,
      { command_id: generateCommandId() }
    );

    console.log('✅ Streaming stopped');
    return response.data.data;
  } catch (error) {
    console.error('❌ Error stopping streaming:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get call information
 * @param {string} callControlId - Call control ID
 * @returns {Promise<Object>} Call details
 */
export async function getCall(callControlId) {
  try {
    const response = await apiClient.get(`/calls/${callControlId}`);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error fetching call:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Generate a unique command ID
 * @returns {string} Command ID
 */
function generateCommandId() {
  return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default {
  makeCall,
  answerCall,
  rejectCall,
  hangupCall,
  sendDtmf,
  startStreaming,
  stopStreaming,
  getCall
};
