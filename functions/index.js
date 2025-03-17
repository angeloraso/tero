const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getMessaging } = require("firebase-admin/messaging");
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

exports.sendPushNotification = onCall(async (request) => {
  try {
    const { topic, title, body, ttl } = request.data;

    console.log("Topic:", topic);
    console.log("Title:", title);
    console.log("Body:", body);
    console.log("TTL:", ttl);

    if (!topic) {
      throw new HttpsError("invalid-argument", "Topic is required");
    }

    if (!title) {
      throw new HttpsError("invalid-argument", "Title is required");
    }

    if (!body) {
      throw new HttpsError("invalid-argument", "Body is required");
    }

    const message = {
      notification: {
        title,
        body
      },
      android:{
        priority: 'high',
        ttl: ttl || 5 * 60 * 1000, // 5 minutes
        restrictedPackageName: 'ar.com.tero',
      },
      topic: topic || 'garbage'
    };

    const response = await getMessaging().send(message);
    console.log("Notificación enviada:", response);
    return { success: true, response };
  } catch (error) {
    console.error("Error enviando notificación:", error);
    throw new HttpsError("internal", error.message);
  }
});
