import express from 'express';
import callManager from '../callManager.js';

const router = express.Router();

/**
 * GET /calls - List all active calls
 */
router.get('/', (req, res) => {
  const activeCalls = callManager.getActiveCalls();
  res.render('calls/list', {
    pageTitle: 'Active Calls',
    calls: activeCalls
  });
});

/**
 * GET /calls/new - New call form
 */
router.get('/new', (req, res) => {
  res.render('calls/new', {
    pageTitle: 'Make a New Call'
  });
});

/**
 * POST /calls - Make a new call
 */
router.post('/', async (req, res) => {
  try {
    const { toNumber, streamUrl } = req.body;

    if (!toNumber) {
      return res.status(400).render('error', {
        message: 'Destination number is required'
      });
    }

    const callOptions = {
      to: toNumber,
      streamUrl: streamUrl || process.env.WEBSOCKET_SERVER_URL
    };

    const callData = await callManager.makeCall(callOptions);

    res.json({
      success: true,
      callId: callData.callId,
      controlId: callData.controlId,
      message: 'Call initiated successfully'
    });
  } catch (error) {
    console.error('Error making call:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /calls/:callId - View call details
 */
router.get('/:callId', (req, res) => {
  const { callId } = req.params;
  const callInfo = callManager.getCallInfo(callId);

  if (!callInfo) {
    return res.status(404).render('error', {
      message: `Call ${callId} not found`
    });
  }

  res.render('calls/details', {
    pageTitle: 'Call Details',
    call: callInfo
  });
});

/**
 * POST /calls/:callId/hangup - Hangup a call
 */
router.post('/:callId/hangup', async (req, res) => {
  try {
    const { callId } = req.params;
    const callInfo = callManager.getCallInfo(callId);

    if (!callInfo) {
      return res.status(404).json({
        success: false,
        error: 'Call not found'
      });
    }

    await callManager.hangupCall(callInfo.controlId);
    callManager.updateCallStatus(callId, 'completed');

    res.json({
      success: true,
      message: 'Call hung up successfully'
    });
  } catch (error) {
    console.error('Error hanging up call:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /calls/:callId/dtmf - Send DTMF
 */
router.post('/:callId/dtmf', async (req, res) => {
  try {
    const { callId } = req.params;
    const { digits } = req.body;

    const callInfo = callManager.getCallInfo(callId);

    if (!callInfo) {
      return res.status(404).json({
        success: false,
        error: 'Call not found'
      });
    }

    await callManager.sendDtmf(callInfo.controlId, digits);

    res.json({
      success: true,
      message: `DTMF digits ${digits} sent successfully`
    });
  } catch (error) {
    console.error('Error sending DTMF:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
