const sgMail = require("@sendgrid/mail");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, location, timestamp } = req.body;

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: "rapportsafety@gmail.com", // Your security email
    from: "noreply@yourapp.com",
    subject: "🚨 SOS Alert Triggered",
    text:
      "User: " + (username || "Unknown") +
      "\nLocation: " + (location && location.latitude || "N/A") + "," + (location && location.longitude || "N/A") +
      "\nTime: " + (timestamp || "N/A"),
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 