const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const {defineSecret} = require("firebase-functions/params");

admin.initializeApp();

// Define secrets
const sendgridApiKey = defineSecret("SENDGRID_API_KEY");
const sendgridSender = defineSecret("SENDGRID_SENDER");

// Send email when surprise date is created
exports.sendSurpriseEmail = onDocumentCreated({
  document: "surpriseDates/{surpriseId}",
  secrets: [sendgridApiKey, sendgridSender],
}, async (event) => {
  try {
    const surprise = event.data.data();
    
    // Initialize SendGrid
    sgMail.setApiKey(sendgridApiKey.value());
    
    console.log("📧 Sending surprise email to:", surprise.partnerEmail);
    
    // Get creator info
    const creatorDoc = await admin.firestore()
        .collection("users")
        .doc(surprise.creatorId)
        .get();
    
    const creatorName = creatorDoc.data()?.displayName ||
        creatorDoc.data()?.username ||
        "Someone special";
    
    // Email content
    const msg = {
      to: surprise.partnerEmail,
      from: sendgridSender.value(),
      subject: `🎁 ${creatorName} planned a surprise date for you!`,
      html: `
<!DOCTYPE html>
<html>
<head>
<style>
body { 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  line-height: 1.6; 
  color: #333;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}
.container { 
  max-width: 600px; 
  margin: 40px auto; 
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.header { 
  background: linear-gradient(135deg, #ec4899, #a855f7); 
  padding: 40px 30px; 
  text-align: center;
}
.header h1 { 
  color: white; 
  margin: 0; 
  font-size: 32px;
  font-weight: 700;
}
.content { 
  padding: 40px 30px;
}
.content h2 {
  color: #1f2937;
  font-size: 24px;
  margin: 0 0 20px 0;
}
.content p {
  color: #4b5563;
  font-size: 16px;
  margin: 15px 0;
}
.highlight-box {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 12px;
  padding: 20px;
  margin: 25px 0;
  text-align: center;
}
.highlight-box p {
  font-size: 18px;
  font-weight: 600;
  color: #92400e;
  margin: 0;
}
.button { 
  display: inline-block; 
  background: linear-gradient(135deg, #ec4899, #db2777);
  color: white !important;
  padding: 16px 40px; 
  text-decoration: none; 
  border-radius: 30px;
  font-weight: 700;
  font-size: 16px;
  margin: 30px 0;
}
.details {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}
.details p {
  margin: 10px 0;
}
.footer { 
  text-align: center; 
  color: #9ca3af;
  font-size: 14px;
  padding: 30px;
  background: #f9fafb;
}
.footer a {
  color: #ec4899;
  text-decoration: none;
}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>🎁 You Have a Surprise Date!</h1>
  </div>
  
  <div class="content">
    <h2>Hi there! 👋</h2>
    <p><strong>${creatorName}</strong> has planned something special for you on DateMaker!</p>
    
    <div class="details">
      <p><strong>📝 Surprise Title:</strong> ${surprise.title}</p>
      
      ${surprise.scheduledDate ? `
        <p><strong>📅 Scheduled Date:</strong> ${surprise.scheduledDate}${surprise.scheduledTime ? ` at ${surprise.scheduledTime}` : ""}</p>
      ` : "<p><strong>📅 Date:</strong> To be revealed!</p>"}
      
      ${surprise.hints && surprise.hints.length > 0 ? `
        <p><strong>💡 Hints Available:</strong> ${surprise.hints.length} clues to unlock</p>
      ` : ""}
      
      ${surprise.itinerary ? `
        <p><strong>🗺️ Includes:</strong> A full date itinerary</p>
      ` : ""}
    </div>
    
    <div class="highlight-box">
      <p>🎉 Your surprise is waiting in the DateMaker app!</p>
    </div>
    
    <div style="text-align: center;">
      <a href="https://www.thedatemakerapp.com" class="button">
        Open DateMaker App
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
      💡 <em>Log in to DateMaker with <strong>${surprise.partnerEmail}</strong> to see your hints and reveal your surprise!</em>
    </p>
  </div>
  
  <div class="footer">
    <p>Sent with ❤️ from <a href="https://www.thedatemakerapp.com">DateMaker</a></p>
    <p style="font-size: 12px; margin-top: 10px;">
      ${creatorName} invited you to a surprise date. If you didn't expect this, you can safely ignore this email.
    </p>
  </div>
</div>
</body>
</html>
      `,
    };
    
    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${surprise.partnerEmail}`);
    
    // Update Firestore to mark email as sent
    await event.data.ref.update({
      emailSent: true,
      emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return {success: true};
  } catch (error) {
    console.error("❌ Error sending surprise email:", error);
    throw error;
  }
});

// Send notification when surprise is revealed
exports.sendRevealNotification = onDocumentUpdated({
  document: "surpriseDates/{surpriseId}",
  secrets: [sendgridApiKey, sendgridSender],
}, async (event) => {
  try {
    const before = event.data.before.data();
    const after = event.data.after.data();
    
    // Only send if just revealed
    if (!before.revealed && after.revealed) {
      // Initialize SendGrid
      sgMail.setApiKey(sendgridApiKey.value());
      
      console.log("🎉 Surprise revealed! Notifying creator...");
      
      const surprise = after;
      
      // Get creator info
      const creatorDoc = await admin.firestore()
          .collection("users")
          .doc(surprise.creatorId)
          .get();
      
      const creatorName = creatorDoc.data()?.displayName ||
          creatorDoc.data()?.username ||
          "There";
      
      const partnerEmail = surprise.partnerEmail;
      
      // Email to CREATOR
      const msg = {
        to: surprise.creatorEmail,
        from: sendgridSender.value(),
        subject: "🎉 Your surprise date was just revealed!",
        html: `
<!DOCTYPE html>
<html>
<head>
<style>
body { 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}
.container { 
  max-width: 600px; 
  margin: 40px auto; 
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.header { 
  background: linear-gradient(135deg, #10b981, #059669); 
  padding: 40px 30px; 
  text-align: center;
}
.header h1 { 
  color: white; 
  margin: 0; 
  font-size: 32px;
}
.content { 
  padding: 40px 30px;
  text-align: center;
}
.content p {
  font-size: 16px;
  color: #4b5563;
  line-height: 1.6;
}
.highlight {
  background: #ecfdf5;
  border-radius: 12px;
  padding: 20px;
  margin: 25px 0;
}
.footer { 
  text-align: center; 
  color: #9ca3af;
  font-size: 14px;
  padding: 30px;
  background: #f9fafb;
}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>🎉 Surprise Revealed!</h1>
  </div>
  
  <div class="content">
    <p style="font-size: 20px; font-weight: 600; color: #1f2937;">
      Great news, ${creatorName}!
    </p>
    <p>
      Your partner (${partnerEmail}) just revealed the surprise date you planned for them!
    </p>
    
    <div class="highlight">
      <p style="font-size: 18px; font-weight: 600; color: #065f46; margin: 0;">
        "${surprise.title}"
      </p>
      ${surprise.itinerary ? '<p style="margin: 10px 0; color: #047857;">They can now see the full itinerary! 🗺️</p>' : ""}
    </div>
    
    <p style="font-size: 18px; margin-top: 30px;">
      Have an amazing date together! 💕
    </p>
  </div>
  
  <div class="footer">
    <p>- The DateMaker Team</p>
  </div>
</div>
</body>
</html>
        `,
      };
      
      await sgMail.send(msg);
      console.log("✅ Reveal notification sent to creator");
      return {success: true};
    }
    
    return null;
  } catch (error) {
    console.error("❌ Error sending reveal notification:", error);
    throw error;
  }
});