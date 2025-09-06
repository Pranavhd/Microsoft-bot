const { ActivityHandler, MessageFactory } = require('botbuilder');
const restify = require('restify');
const axios = require('axios');
require('dotenv').config();

// Create HTTP server
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

// Bot Framework Adapter
const { BotFrameworkAdapter } = require('botbuilder');

const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Error handler
adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError] unhandled error: ${error}`);
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Teams Bot Class
class TeamsApiBot extends ActivityHandler {
    constructor() {
        super();
        
        // Store conversation references for periodic API calls
        this.conversationReferences = {};
        
        // Start periodic API calls
        this.startPeriodicApiCalls();

        // Handle messages
        this.onMessage(async (context, next) => {
            console.log(`Message received: ${context.activity.text}`);
            
            // Store conversation reference
            this.addConversationReference(context.activity);
            
            // Process the message (you can add your logic here)
            await this.processMessage(context);
            
            await next();
        });

        // Handle members added
        this.onMembersAdded(async (context, next) => {
            const welcomeText = 'Hello! I\'m your Teams API bot. I\'ll listen to conversations and make periodic API calls every 5 minutes.';
            for (let cnt = 0; cnt < context.activity.membersAdded.length; ++cnt) {
                if (context.activity.membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText));
                }
            }
            await next();
        });
    }

    // Store conversation reference for later use
    addConversationReference(activity) {
        const conversationReference = {
            conversationReference: {
                conversation: { id: activity.conversation.id },
                user: activity.from,
                bot: activity.recipient,
                serviceUrl: activity.serviceUrl,
                channelId: activity.channelId
            }
        };
        
        this.conversationReferences[activity.conversation.id] = conversationReference.conversationReference;
        console.log(`Stored conversation reference for: ${activity.conversation.id}`);
    }

    // Process incoming messages
    async processMessage(context) {
        const messageText = context.activity.text?.toLowerCase() || '';
        
        // Simple response based on message content
        if (messageText.includes('status')) {
            await context.sendActivity('Bot is running and making API calls every 5 minutes.');
        } else if (messageText.includes('api')) {
            await context.sendActivity('I will make an API call now...');
            await this.makeApiCall(context);
        } else {
            // Log the conversation for monitoring
            console.log(`Conversation logged: ${context.activity.text}`);
        }
    }

    // Make external API call
    async makeApiCall(context = null) {
        try {
            const apiUrl = process.env.EXTERNAL_API_URL || 'https://jsonplaceholder.typicode.com/posts/1';
            const apiKey = process.env.EXTERNAL_API_KEY;
            
            const headers = {};
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }

            console.log(`Making API call to: ${apiUrl}`);
            
            const response = await axios.get(apiUrl, { headers });
            
            console.log('API Response:', response.data);
            
            // If context is provided, send response to Teams
            if (context) {
                await context.sendActivity(`API call successful! Response: ${JSON.stringify(response.data, null, 2)}`);
            }
            
            return response.data;
        } catch (error) {
            console.error('API call failed:', error.message);
            
            if (context) {
                await context.sendActivity(`API call failed: ${error.message}`);
            }
        }
    }

    // Start periodic API calls every 5 minutes
    startPeriodicApiCalls() {
        console.log('Starting periodic API calls every 5 minutes...');
        
        setInterval(async () => {
            console.log('Making scheduled API call...');
            await this.makeApiCall();
            
            // Optionally notify active conversations about the API call
            await this.notifyConversations('Scheduled API call completed.');
        }, 10 * 1000); // 5 minutes in milliseconds
    }

    // Notify all active conversations
    async notifyConversations(message) {
        for (const conversationId in this.conversationReferences) {
            try {
                const conversationReference = this.conversationReferences[conversationId];
                
                await adapter.continueConversation(conversationReference, async (context) => {
                    await context.sendActivity(MessageFactory.text(message));
                });
            } catch (error) {
                console.error(`Failed to notify conversation ${conversationId}:`, error.message);
            }
        }
    }
}

// Create the bot
const bot = new TeamsApiBot();

// Listen for incoming requests
server.post('/api/messages', async (req, res) => {
    await adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});

// Start the server
const port = process.env.PORT || 3978;
server.listen(port, () => {
    console.log(`\n${server.name} listening on port ${port}`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo test your bot in Teams, sideload the app manifest.json within Microsoft Teams');
});
