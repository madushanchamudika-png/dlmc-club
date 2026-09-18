require("dotenv").config();

const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Payment screenshot upload
const upload = multer({
    dest: "uploads/"
});

// Serve website
app.use(express.static(__dirname));

// Test route
app.get("/test", (req, res) => {
    res.send("DLMC CLUB SERVER IS WORKING!");
});

// Receive rank request
app.post(
    "/request-rank",
    upload.single("paymentScreenshot"),
    async (req, res) => {

        try {

            const {
                minecraftUsername,
                transferReference,
                rank,
                price
            } = req.body;

            console.log("==============================");
            console.log("NEW RANK REQUEST");
            console.log("Username:", minecraftUsername);
            console.log("Rank:", rank);
            console.log("Price:", price);
            console.log("Reference:", transferReference);
            console.log("==============================");

            // Check Telegram settings
            if (!BOT_TOKEN || !CHAT_ID) {
                console.error("❌ Telegram environment variables missing!");

                return res.status(500).json({
                    success: false,
                    message: "Telegram configuration missing."
                });
            }

            // Telegram message
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
Attached below.`;

            // Send message to Telegram
            await axios.post(
                `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
                {
                    chat_id: CHAT_ID,
                    text: message
                }
            );

            console.log("✅ Telegram message sent!");

            // Send screenshot
            if (req.file) {

                const form = new FormData();

                form.append("chat_id", CHAT_ID);
                form.append(
                    "photo",
                    fs.createReadStream(req.file.path)
                );

                form.append(
                    "caption",
                    `💳 Payment Screenshot\n👤 ${minecraftUsername}\n🏆 ${rank}`
                );

                await axios.post(
                    `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
                    form,
                    {
                        headers: form.getHeaders()
                    }
                );

                console.log("✅ Payment screenshot sent!");
            }

            // Delete uploaded file
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) {
                        console.log("Could not delete temporary file.");
                    }
                });
            }

            res.json({
                success: true,
                message: "Request sent successfully!"
            });

        } catch (error) {

            console.error("❌ TELEGRAM ERROR:");

            if (error.response) {
                console.error(error.response.data);
            } else {
                console.error(error.message);
            }

            res.status(500).json({
                success: false,
                message: "Failed to send request to Telegram."
            });
        }
    }
);

app.listen(PORT, () => {
    console.log("================================");
    console.log("       DLMC CLUB SERVER");
    console.log("================================");
    console.log(`Server running on port ${PORT}`);
    console.log("Telegram Chat ID:", CHAT_ID);
    console.log("================================");
});
