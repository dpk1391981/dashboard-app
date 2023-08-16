const express = require("express");
const { google } = require("googleapis");
// const open = require("open");
const router = express.Router();
const oauth2Client = new google.auth.OAuth2(
  "544588882822-b1fugi7i9hihops1kbddtpq35h3qi4s7.apps.googleusercontent.com",
  "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",
  "http://localhost:5000/api/metrics/ga/auth/oauth2callback",
);

const SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"];

router.get("/", (req, res) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      include_granted_scopes: true,
    });
    res.redirect(authUrl);
  } catch (error) {}
});

router.get("/oauth2callback", async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log("==============tokens======================");
    console.log(tokens);
    console.log("==============tokens======================");

    console.log("==============oauth2Client======================");
    console.log(oauth2Client);
    console.log("==============oauth2Client======================");
    const analytics = google.analyticsreporting({
      version: "v4",
      auth: oauth2Client,
    });

    console.log("============analytics.management========================");
    console.log(analytics.management);
    console.log("=============analytics.management=======================");
    analytics.management.accounts.list({}, (err, response) => {
      if (err) {
        console.error("Error:", err);
        return;
      }

      const accountId = response.data.items[0].id;
      analytics.management.webproperties.list({ accountId }, (err, response) => {
        if (err) {
          console.error("Error:", err);
          return;
        }

        const propertyId = response.data.items[0].id;
        console.log("Property ID:", propertyId);
      });
    });

    res.send("Property ID fetched. Check the console.");
  } catch (error) {
    console.log("=============error=======================");
    console.log(error);
    res.send(error);
    console.log("=============error=======================");
  }
});

module.exports = router;
