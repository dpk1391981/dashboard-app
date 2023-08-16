const express = require("express");
const app = express();
const router = express.Router();

/**
 * TODO(developer): Uncomment this variable and replace with your
 *   Google Analytics 4 property ID before running the sample.
 */
// propertyId = 'YOUR-GA4-PROPERTY-ID';

// Imports the Google Analytics Data API client library.
const { BetaAnalyticsDataClient } = require("@google-analytics/data");

// Using a default constructor instructs the client to use the credentials
// specified in GOOGLE_APPLICATION_CREDENTIALS environment variable.
const analyticsDataClient = new BetaAnalyticsDataClient();

const { Storage } = require("@google-cloud/storage");

async function authenticateImplicitWithAdc() {
  try {
    // This snippet demonstrates how to list buckets.
    // NOTE: Replace the client created below with the client required for your application.
    // Note that the credentials are not specified when constructing the client.
    // The client library finds your credentials using ADC.
    const storage = new Storage({
      projectId: "imdeepak",
    });
    const [buckets] = await storage.getBuckets();
    console.log("Buckets:");

    for (const bucket of buckets) {
      console.log(`- ${bucket.name}`);
    }

    console.log("Listed all storage buckets.");
  } catch (error) {
    console.log("==============authenticateImplicitWithAdc======================");
    console.log(error);
    console.log("===============authenticateImplicitWithAdc=====================");
  }
}

// authenticateImplicitWithAdc();

// Runs a simple report.
async function runReport() {
  return new Promise(async (resolve, reject) => {
    try {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/402678186`,
        dateRanges: [
          {
            startDate: "2023-08-14",
            endDate: "today",
          },
        ],
        dimensions: [
          {
            name: "city",
          },
        ],
        metrics: [
          {
            name: "activeUsers",
          },
        ],
      });

      console.log("Report result:");
      console.log("====================================");
      console.log(response);
      console.log("====================================");
      //   response.rows.forEach((row) => {
      //     console.log("====================================");
      //     console.log(row);
      //     console.log("====================================");
      //     console.log(row.dimensionValues[0], row.metricValues[0]);
      //   });
      resolve(response);
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  });
}

router.get("/ga", async (req, res) => {
  const { metrics, startDate, endDate } = req.query;
  console.log(`Requested metrics: ${metrics}`);
  console.log(`Requested start-date: ${startDate}`);
  console.log(`Requested end-date: ${endDate}`);

  await runReport();
});

module.exports = router;
