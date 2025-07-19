/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();
sgMail.setApiKey(functions.config().sendgrid.key);

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Cloud Function: Send SOS Alert Email
exports.sendSosAlertEmail = functions.firestore
    .document("sos_alerts/{alertId}")
    .onCreate(async (snap, context) => {
      const data = snap.data();
      const msg = {
        to: "rapportsafety@gmail.com", // TODO: Replace with your security email
        from: "noreply@yourapp.com",
        subject: "🚨 SOS Alert Triggered",
        text:
          "User: " +
          (data.profileInfo && data.profileInfo.username || "Unknown") +
          "\nLocation: " +
          (data.location && data.location.latitude) + "," +
          (data.location && data.location.longitude) +
          "\nTime: " +
          data.timestamp,
      };
      try {
        await sgMail.send(msg);
        functions.logger.info("SOS alert email sent.");
      } catch (error) {
        functions.logger.error("Error sending SOS alert email:", error);
      }
    });

// Cloud Function: Push Notification for SOS Alert
exports.notifyOnSos = functions.firestore
    .document("sos_alerts/{alertId}")
    .onCreate(async (snap, context) => {
      const payload = {
        notification: {
          title: "SOS Alert Nearby!",
          body: "A new SOS alert has been triggered near your location.",
        },
      };
      try {
      // Send to all users subscribed to 'sos_alerts' topic
        await admin.messaging().sendToTopic("sos_alerts", payload);
        functions.logger.info("SOS alert notification sent.");
      } catch (error) {
        functions.logger.error("Error sending SOS alert notification:", error);
      }
    });
