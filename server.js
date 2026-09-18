require("dotenv").config();

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// TELEGRAM
// ========================================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// DLMC CLUB PAYMENTS GROUP
const CHAT_ID = "-5384139242";

// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ========================================
// UPLOAD
// ========================================

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
    dest: uploadDir
});

// ========================================
// TEST
// ========================================

app.get("/test", (req, res) => {
    res.send("DLMC CLUB SERVER IS WORKING!");
});
// ========================================
// RANK REQUEST
// ========================================

app.post(
    "/request-rank",
    upload.single("paymentScreenshot"),
    async (req, res) => {

        let filePath = null;

        try {

            const {
                minecraftUsername,
                transferReference,
                rank,
                price
            } = req.body;

            filePath = req.file?.path || null;

            // Check request data
            if (
                !minecraftUsername ||
                !transferReference ||
                !rank ||
                !price ||
                !req.file
            ) {
                if (filePath) {
                    fs.unlink(filePath, () => {});
                }

                return res.status(400).json({
                    success: false,
                    message: "Missing request details."
                });
            }

            // Check Telegram token
            if (!BOT_TOKEN) {

                if (filePath) {
                    fs.unlink(filePath, () => {});
                }

                return res.status(500).json({
                    success: false,
                    message: "TELEGRAM_BOT_TOKEN is missing."
                });
            }

            console.log("");
            console.log("================================");
            console.log("🛒 NEW DLMC RANK REQUEST");
            console.log("================================");
            console.log("Minecraft:", minecraftUsername);
            console.log("Rank:", rank);
            console.log("Price:", price);
            console.log("Reference:", transferReference);
            console.log("Telegram Group:", CHAT_ID);
            console.log("================================");

            // ========================================
            // TELEGRAM MESSAGE
            // ========================================

            const message =
`🛒 NEW DLMC CLUB RANK REQUEST

👤 Minecraft Username:
${minecraftUsername}

🏆 Rank:
${rank}

💰 Price:
Rs. ${price}

🧾 Transfer Reference:
${transferReference}

📸 Payment Screenshot:
Attached below.

━━━━━━━━━━━━━━━━━━
🤖 DLMC CLUB WEB STORE`;

            console.log("📤 Sending message to Telegram...");

            const telegramMessage = await axios.post(
                `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
                {
                    chat_id: CHAT_ID,
                    text: message
                }
            );

            console.log("✅ Telegram message sent!");
            console.log(telegramMessage.data);

            // ========================================
            // PAYMENT SCREENSHOT
            // ========================================

            console.log("📤 Sending payment screenshot...");

            const photoForm = new FormData();

            photoForm.append(
                "chat_id",
                CHAT_ID
            );

            photoForm.append(
                "photo",
                fs.createReadStream(filePath)
            );

            photoForm.append(
                "caption",
`💳 PAYMENT SCREENSHOT

👤 Username:
${minecraftUsername}

🏆 Rank:
${rank}

💰 Price:
Rs. ${price}

🧾 Reference:
${transferReference}

━━━━━━━━━━━━━━━━━━
🤖 DLMC CLUB WEB STORE`
            );

            const telegramPhoto = await axios.post(
                `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
                photoForm,
                {
                    headers: photoForm.getHeaders()
                }
            );

            console.log("✅ Screenshot sent!");
            console.log(telegramPhoto.data);

            // ========================================
            // DELETE TEMP FILE
            // ========================================

            if (filePath) {
                fs.unlink(filePath, () => {});
            }

            // ========================================
            // SUCCESS
            // ========================================

            console.log("================================");
            console.log("✅ TELEGRAM REQUEST SENT");
            console.log("================================");

            return res.json({
                success: true,
                message: "Request sent to Telegram!"
            });

        } catch (error) {

            console.log("");
            console.log("================================");
            console.log("❌ TELEGRAM ERROR");
            console.log("================================");

            console.log(
                "Message:",
                error.message
            );

            console.log(
                "Status:",
                error.response?.status
            );

            console.log(
                "Telegram Response:",
                error.response?.data
            );

            console.log("================================");

            if (filePath) {
                fs.unlink(filePath, () => {});
            }

            return res.status(500).json({
                success: false,
                message: "Could not send request to Telegram."
            });
        }
    }
);

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {

    console.log("");
    console.log("================================");
    console.log("       DLMC CLUB SERVER");
    console.log("================================");
    console.log(`Website: http://localhost:${PORT}`);
    console.log("Server is running!");
    console.log("Telegram Chat ID:", CHAT_ID);
    console.log("================================");

});
