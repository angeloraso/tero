const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getMessaging } = require("firebase-admin/messaging");
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

exports.sendPushNotification = onCall(async (request) => {
  try {
    const { title, body } = request.data;

    if (!title || !body) {
      throw new HttpsError("invalid-argument", "Faltan parámetros: title o body");
    }

    const message = {
      notification: {
        title,
        body
      },
      android:{
        priority: 'high',
        ttl: 5 * 60 * 1000, // 5 minutes
        restrictedPackageName: 'ar.com.tero',
      },
      topic: 'garbage'
    };

    const response = await getMessaging().send(message);
    console.log("Notificación enviada:", response);
    return { success: true, response };
  } catch (error) {
    console.error("Error enviando notificación:", error);
    throw new HttpsError("internal", error.message);
  }
});
