const puppeteer = require("puppeteer");
const SerialPort = require("serialport");

// Replace with your actual port name (check Arduino IDE for correct port)
const arduinoPort = new SerialPort({
  path: "COM3", // Change this to match your system
  baudRate: 9600, // Must match the Arduino sketch
});

async function scrapeAndSendToArduino() {
  const url = "https://www.youtube.com/@SLRAWANA-h9b";
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
      `[${new Date().toLocaleTimeString()}] Sending to Arduino: ${text}`
    );

    // Send to Arduino
    arduinoPort.write(text + "\n", (err) => {
      if (err) {
        return console.error("Error on write:", err.message);
      }
    });
  } catch (err) {
    console.error("Error occurred:", err.message);
  } finally {
    await browser.close();
  }
}

// Schedule every 30 seconds
setInterval(scrapeAndSendToArduino, 30 * 1000);

// Run immediately on start
scrapeAndSendToArduino();
