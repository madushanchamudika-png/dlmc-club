require("dotenv").config();

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const PORT = 3000;

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const upload = multer({
    dest: uploadDir
});

app.use(express.static(__dirname));

app.post("/request-rank", upload.single("paymentScreenshot"), async (req, res) => {

    try {

        const {
            minecraftUsername,
            transferReference,
            rank,
            price
        } = req.body;

        if (!minecraftUsername || !transferReference || !rank || !price || !req.file) {
            return res.status(400).json({
                success: false,
                message: "Missing request details."
            });
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        // YOUR PERSONAL TELEGRAM CHAT ID
        const chatId = "8247776205";

        if (!botToken) {
            console.log("❌ TELEGRAM_BOT_TOKEN NOT FOUND");

            return res.status(500).json({
                success: false,
                message: "Telegram bot token is not configured."
            });
        }

        const message =
`🔔 DLMC CLUB RANK REQUEST

👤 Minecraft: ${minecraftUsername}
🏆 Rank: ${rank}
💰 Price: Rs. ${price}
🧾 Transfer Reference: ${transferReference}`;

        console.log("📤 Sending message to Telegram...");

        const telegramMessage = await axios.post(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
                chat_id: chatId,
                text: message
            }
        );

        console.log("✅ Telegram message sent");
        console.log(telegramMessage.data);

        console.log("📤 Sending payment screenshot...");

        const photoForm = new FormData();

        photoForm.append("chat_id", chatId);
        photoForm.append(
            "photo",
            fs.createReadStream(req.file.path)
        );

        photoForm.append(
            "caption",
            `📸 Payment Screenshot\n👤 ${minecraftUsername}\n🏆 ${rank}`
        );

        const telegramPhoto = await axios.post(
            `https://api.telegram.org/bot${botToken}/sendPhoto`,
            photoForm,
            {
                headers: photoForm.getHeaders()
            }
        );

        console.log("✅ Screenshot sent");
        console.log(telegramPhoto.data);

        fs.unlink(req.file.path, () => {});

        console.log("================================");
        console.log("   TELEGRAM REQUEST SENT");
        console.log("================================");
        console.log("Minecraft:", minecraftUsername);
        console.log("Rank:", rank);
        console.log("Price:", price);
        console.log("Reference:", transferReference);
        console.log("================================");

        res.json({
            success: true,
            message: "Request sent to Telegram!"
        });

    } catch (error) {

        console.log("");
        console.log("================================");
        console.log("       TELEGRAM ERROR");
        console.log("================================");

        console.log("Message:", error.message);
        console.log("Status:", error.response?.status);
        console.log("Telegram Response:", error.response?.data);

        console.log("================================");

        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }

        res.status(500).json({
            success: false,
            message: "Could not send request to Telegram."
        });
    }
});

app.listen(PORT, () => {

    console.log("");
    console.log("================================");
    console.log("       DLMC CLUB SERVER");
    console.log("================================");
    console.log("Website: http://localhost:3000");
    console.log("Server is running!");
    console.log("Telegram Chat ID: 8247776205");
    console.log("================================");

});