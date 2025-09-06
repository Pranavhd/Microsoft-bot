# Microsoft Teams API Bot

A simple Microsoft Teams bot that listens to conversations and makes periodic API calls every 5 minutes.

## Features

- **Conversation Listening**: Monitors all messages in Teams channels and chats
- **Periodic API Calls**: Automatically makes API calls every 5 minutes
- **Simple Integration**: Easy to set up and deploy
- **Configurable**: External API endpoint and authentication via environment variables

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your configuration:
   - `MICROSOFT_APP_ID`: Your bot's App ID from Azure Bot Service
   - `MICROSOFT_APP_PASSWORD`: Your bot's App Password from Azure Bot Service
   - `EXTERNAL_API_URL`: The API endpoint you want to call
   - `EXTERNAL_API_KEY`: API key for authentication (optional)
   - `PORT`: Server port (default: 3978)

### 3. Register Your Bot

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new "Azure Bot" resource
3. Get the App ID and App Password
4. Update your `.env` file with these credentials

### 4. Update Teams Manifest

1. Open `manifest.json`
2. Replace `your-app-id-here` with your actual App ID
3. Update the `validDomains` with your bot's domain

### 5. Run the Bot

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

### 6. Deploy to Teams

1. Create a zip file containing `manifest.json` and icon files
2. In Microsoft Teams, go to Apps > Manage your apps > Upload an app
3. Upload the zip file

## How It Works

- The bot listens to all messages in Teams conversations
- Every 5 minutes, it makes an API call to the configured external endpoint
- Users can interact with the bot using commands:
  - Type "status" to check if the bot is running
  - Type "api" to trigger an immediate API call

## API Integration

The bot is configured to call an external API every 5 minutes. By default, it uses a test endpoint (JSONPlaceholder), but you can configure it to call any REST API by updating the `EXTERNAL_API_URL` in your `.env` file.

## Customization

You can modify the bot's behavior by editing `index.js`:
- Change the API call interval (currently 5 minutes)
- Add custom message processing logic
- Modify the API call format or add additional endpoints
- Add more sophisticated conversation analysis

## Troubleshooting

- Make sure your bot is properly registered in Azure
- Verify that the App ID and Password are correct
- Check that your external API is accessible
- Ensure the bot has proper permissions in Teams

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables for all sensitive configuration
- Implement proper error handling for API calls
- Consider rate limiting for external API calls
