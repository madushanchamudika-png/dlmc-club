const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 3000;

// Payment screenshot upload
const upload = multer({
    dest: "uploads/"
});

// Serve your website files
app.use(express.static(__dirname));

// Receive rank request
app.post("/request-rank", upload.single("paymentScreenshot"), async (req, res) => {

    const {
        minecraftUsername,
        transferReference,
        rank,
        price
    } = req.body;

    console.log("NEW RANK REQUEST");
    console.log("Username:", minecraftUsername);
    console.log("Rank:", rank);
    console.log("Price:", price);
    console.log("Reference:", transferReference);

    res.json({
        success: true,
        message: "Request received successfully!"
    });
});

app.listen(PORT, () => {
    console.log(`DLMC CLUB website running at http://localhost:${PORT}`);
});
