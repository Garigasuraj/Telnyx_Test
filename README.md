# Telnyx Media Streaming Application

A comprehensive Node.js application demonstrating real-time media streaming capabilities with Telnyx's Call Control API over WebSockets. Built with Express.js and EJS for Server-Side Rendering with a modern, responsive UI.

## 🎯 Features

- **📞 Outbound Call Management** - Initiate and manage outbound calls with full control
- **🎙️ Real-time Media Streaming** - WebSocket-based media streaming with PCMU, PCMA, G722, OPUS, AMR-WB, and L16 codecs
- **☎️ DTMF Detection & Sending** - Send and receive DTMF digits during calls
- **📊 Live Call Monitoring** - Real-time dashboard with active calls
- **🔗 Webhook Integration** - Receive call events (answered, completed, hangup, streaming started/stopped)
- **📱 Responsive Web UI** - Server-Side Rendered dashboard with EJS templates
- **🔐 Secure Configuration** - Environment variables for sensitive API keys

## 🛠️ Technology Stack

- Node.js v18+ with Express.js
- EJS (Server-Side Rendering)
- WebSockets (ws library)
- Telnyx Call Control API v2
- CSS3 with responsive design

## 📋 Prerequisites

- Node.js v18 or higher
- npm or yarn
- Telnyx account with:
  - Purchased phone number
  - Connection ID
  - API key

## 🚀 Quick Start

### 1. Installation

```bash
git clone <repository-url>
cd Telnyx_Test_APP
npm install
```

### 2. Configuration

```bash
cp .env.example .env
# Edit .env with your Telnyx credentials
```

### 3. Run

```bash
npm run dev  # Development with auto-reload
# or
npm start    # Production mode
```

Visit `http://localhost:3000` in your browser!

## 📱 Web Interface

- **Dashboard** (`/`) - Overview and quick links
- **Active Calls** (`/calls`) - Monitor all active calls in real-time
- **New Call** (`/calls/new`) - Initiate outbound calls
- **Call Details** (`/calls/:callId`) - View detailed call information

## 🔌 Key Features

### Make Calls
- Initiate outbound calls with Telnyx Connection
- Optional WebSocket streaming URLs
- Configure stream tracks (inbound, outbound, or both)

### Real-time Monitoring
- Live call dashboard
- Call duration tracking
- Media streaming statistics
- DTMF event logging

### Media Streaming
- Bidirectional RTP streaming
- Multiple codec support
- Real-time audio processing

## 🌐 Deployment

### Heroku
```bash
heroku create your-app-name
heroku config:set TELNYX_API_KEY=your_key
git push heroku main
```

### Docker
```bash
docker build -t telnyx-app .
docker run -p 3000:3000 --env-file .env telnyx-app
```

## 📚 API Endpoints

- `GET /calls` - List active calls
- `POST /calls` - Create new call
- `GET /calls/:callId` - View call details
- `POST /calls/:callId/hangup` - Hang up call
- `POST /calls/:callId/dtmf` - Send DTMF digits
- `POST /webhooks` - Receive Telnyx events

## 🔐 Security Notes

- Never commit `.env` files with real credentials
- Use HTTPS/WSS in production
- Implement rate limiting on endpoints
- Validate all webhook signatures

## 📝 Environment Variables

See `.env.example` for all available configuration options.

## 🐛 Troubleshooting

- **Connection Error**: Verify API key and Connection ID
- **Call Not Initiating**: Check destination number format and account credit
- **WebSocket Issues**: Ensure firewall allows WebSocket connections

## 📚 Resources

- [Telnyx Documentation](https://developers.telnyx.com)
- [Media Streaming Guide](https://developers.telnyx.com/docs/v2/voice/media-streaming)
- [Call Control API](https://developers.telnyx.com/docs/api/v2/call-control)

## 📄 License

MIT License

---

**Made with ❤️ for Telnyx Developers**
