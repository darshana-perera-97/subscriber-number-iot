const puppeteer = require("puppeteer");

async function scrapeSecondElementText() {
  const url = "https://www.youtube.com/@Raamuwa";
  const className =
    "yt-core-attributed-string yt-content-metadata-view-model-wiz__metadata-text yt-core-attributed-string--white-space-pre-wrap yt-core-attributed-string--link-inherit-color";

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    const classSelector = "." + className.split(" ").join(".");

    await page.waitForFunction(
      (selector) => document.querySelectorAll(selector).length >= 2,
      {},
      classSelector
    );

    const elements = await page.$$(classSelector);
    let text = await page.evaluate((el) => el.textContent.trim(), elements[1]);

    text = text.replace(/subscribers/i, "").trim();

    console.log(
      `[${new Date().toLocaleTimeString()}] No of Subsribers: ${text}`
    );
  } catch (err) {
    console.error("Error occurred:", err.message);
  } finally {
    await browser.close();
  }
}

// Run every 30 seconds
setInterval(scrapeSecondElementText, 30 * 1000);

// Optional: Run immediately on start
scrapeSecondElementText();
