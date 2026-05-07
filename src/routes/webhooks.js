import express from 'express';
import callManager from '../callManager.js';

const router = express.Router();

/**
 * POST /webhooks - Receive Telnyx webhooks
 */
router.post('/', (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'No data in request' });
    }

    console.log(`[Webhook] Received event: ${data.event_type}`);

    const { event_type, payload } = data;

    switch (event_type) {
      case 'call.initiated':
        handleCallInitiated(payload);
        break;

      case 'call.answered':
        handleCallAnswered(payload);
        break;

      case 'call.completed':
        handleCallCompleted(payload);
        break;

      case 'call.hangup':
        handleCallHangup(payload);
        break;

      case 'streaming.started':
        handleStreamingStarted(payload);
        break;

      case 'streaming.stopped':
        handleStreamingStopped(payload);
        break;

      case 'dtmf_received':
        handleDTMFReceived(payload);
        break;

      default:
        console.log(`[Webhook] Unknown event type: ${event_type}`);
    }

    res.json({ success: true, received: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

function handleCallInitiated(payload) {
  console.log('[Webhook] 📞 Call initiated');
  console.log('  From:', payload.from);
  console.log('  To:', payload.to);
  console.log('  Call Control ID:', payload.call_control_id);
}

function handleCallAnswered(payload) {
  console.log('[Webhook] ✅ Call answered');
  console.log('  Duration:', payload.call_duration_secs, 'seconds');
  console.log('  State:', payload.state);
}

function handleCallCompleted(payload) {
  console.log('[Webhook] ⏹️ Call completed');
  console.log('  Duration:', payload.call_duration_secs, 'seconds');
  console.log('  Call Control ID:', payload.call_control_id);
}

function handleCallHangup(payload) {
  console.log('[Webhook] 🔌 Call hung up');
  console.log('  Hangup Source:', payload.hangup_source);
  console.log('  Call Control ID:', payload.call_control_id);
}

function handleStreamingStarted(payload) {
  console.log('[Webhook] 🎙️ Streaming started');
  console.log('  Stream URL:', payload.stream_url);
  console.log('  Call Control ID:', payload.call_control_id);
}

function handleStreamingStopped(payload) {
  console.log('[Webhook] ⏹️ Streaming stopped');
  console.log('  Stream URL:', payload.stream_url);
  console.log('  Call Control ID:', payload.call_control_id);
}

function handleDTMFReceived(payload) {
  console.log('[Webhook] ☎️ DTMF received');
  console.log('  Digit:', payload.digit);
  console.log('  Call Control ID:', payload.call_control_id);
}

export default router;
