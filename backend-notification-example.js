/**
 * Backend Notification Service Example
 * 
 * This is an example of how your backend should send push notifications
 * when interpretations are ready. Add this to your backend API.
 */

const { Expo } = require('expo-server-sdk');
const { createClient } = require('@supabase/supabase-js');

// Initialize Expo SDK
const expo = new Expo();

// Initialize Supabase client (use your service role key on backend)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Send push notification when interpretation is ready
 */
async function sendInterpretationReadyNotification({
  userId,
  dreamId,
  dreamTitle,
  interpretationId,
}) {
  try {
    // 1. Get user's push token and preferences from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('push_token, push_token_platform, notification_preferences')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return;
    }

    if (!profile?.push_token) {
      console.log(`User ${userId} has no push token registered`);
      return;
    }

    // Check if user wants interpretation notifications
    const preferences = profile.notification_preferences || {};
    if (preferences.interpretations === false) {
      console.log(`User ${userId} has disabled interpretation notifications`);
      return;
    }

    // 2. Validate the push token
    if (!Expo.isExpoPushToken(profile.push_token)) {
      console.error(`Push token ${profile.push_token} is not valid`);
      return;
    }

    // 3. Create the notification message
    const message = {
      to: profile.push_token,
      sound: 'default',
      title: 'Dream Interpretation Ready! 🌙',
      body: `Your interpretation for "${dreamTitle || 'your dream'}" is ready to view.`,
      data: {
        type: 'interpretation_ready',
        dreamId,
        interpretationId,
      },
      priority: 'high',
      channelId: 'interpretations', // Android channel we created
    };

    // 4. Send the notification
    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
        console.log('Notification tickets:', ticketChunk);
      } catch (error) {
        console.error('Error sending notification chunk:', error);
      }
    }

    // 5. Store ticket IDs for later receipt checking (optional but recommended)
    // You can check receipts later to verify delivery
    for (const ticket of tickets) {
      if (ticket.status === 'ok') {
        console.log(`Notification sent successfully: ${ticket.id}`);
        // Optionally store ticket.id in database to check receipt later
      } else {
        console.error(`Notification failed: ${ticket.message}`);
      }
    }

    return tickets;
  } catch (error) {
    console.error('Error in sendInterpretationReadyNotification:', error);
    throw error;
  }
}

/**
 * Check notification receipts (optional - run periodically)
 */
async function checkNotificationReceipts(ticketIds) {
  const receiptIds = ticketIds.filter(id => id); // Filter out any null/undefined
  
  if (receiptIds.length === 0) return;

  const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  
  for (const chunk of receiptIdChunks) {
    try {
      const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      
      for (const receiptId in receipts) {
        const receipt = receipts[receiptId];
        
        if (receipt.status === 'ok') {
          console.log(`Notification ${receiptId} was delivered`);
        } else if (receipt.status === 'error') {
          console.error(`Notification ${receiptId} failed:`, receipt.message);
          
          if (receipt.details?.error === 'DeviceNotRegistered') {
            // The device token is no longer valid, remove it from database
            // await removeInvalidPushToken(receipt.expoPushToken);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
    }
  }
}

/**
 * Example: Integrate with your interpretation completion flow
 */
async function onInterpretationComplete(interpretation) {
  // This would be called when your AI finishes processing an interpretation
  
  // Get dream details
  const { data: dream } = await supabase
    .from('dreams')
    .select('title')
    .eq('id', interpretation.dream_id)
    .single();

  // Send push notification
  await sendInterpretationReadyNotification({
    userId: interpretation.user_id,
    dreamId: interpretation.dream_id,
    dreamTitle: dream?.title,
    interpretationId: interpretation.id,
  });
}

/**
 * Example Express.js endpoint
 */
// app.post('/api/v1/notifications/send-interpretation-ready', async (req, res) => {
//   const { userId, dreamId, interpretationId } = req.body;
//   
//   try {
//     const tickets = await sendInterpretationReadyNotification({
//       userId,
//       dreamId,
//       interpretationId,
//     });
//     
//     res.json({ success: true, tickets });
//   } catch (error) {
//     console.error('Error sending notification:', error);
//     res.status(500).json({ error: 'Failed to send notification' });
//   }
// });

module.exports = {
  sendInterpretationReadyNotification,
  checkNotificationReceipts,
  onInterpretationComplete,
};