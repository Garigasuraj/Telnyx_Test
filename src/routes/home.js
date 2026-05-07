import express from 'express';

const router = express.Router();

/**
 * GET / - Dashboard home page
 */
router.get('/', (req, res) => {
  res.render('index', {
    pageTitle: 'Dashboard',
    appName: 'Telnyx Media Streaming',
    telnyxPhoneNumber: process.env.TELNYX_PHONE_NUMBER || 'Not configured'
  });
});

/**
 * GET /about - About page
 */
router.get('/about', (req, res) => {
  res.render('about', {
    pageTitle: 'About',
    appName: 'Telnyx Media Streaming'
  });
});

export default router;
