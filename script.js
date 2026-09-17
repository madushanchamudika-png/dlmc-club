let selectedRank = "";
let selectedPrice = 0;

function openRequest(rank, price) {
    selectedRank = rank;
    selectedPrice = price;

    document.getElementById("selectedRank").textContent = rank;
    document.getElementById("selectedPrice").textContent = "Rs. " + price;

    document.getElementById("requestModal").style.display = "flex";
}

function closeRequest() {
    document.getElementById("requestModal").style.display = "none";
}

function copyIP() {
    navigator.clipboard.writeText("play.dlmc.club");
    alert("Server IP copied!");
}

window.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("requestForm");

    if (!form) {
        console.log("❌ requestForm NOT FOUND");
        return;
    }

    console.log("✅ requestForm found");

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        console.log("🚀 FORM SUBMITTED");

        const username =
            document.getElementById("minecraftUsername").value.trim();

        const reference =
            document.getElementById("transferReference").value.trim();

        const screenshot =
            document.getElementById("paymentScreenshot").files[0];

        console.log("Username:", username);
        console.log("Reference:", reference);
        console.log("Screenshot:", screenshot);

        if (!username || !reference || !screenshot) {
            alert("Please fill all fields.");
            return;
        }

        const formData = new FormData();

        formData.append("minecraftUsername", username);
        formData.append("transferReference", reference);
        formData.append("rank", selectedRank);
        formData.append("price", selectedPrice);
        formData.append("paymentScreenshot", screenshot);

        console.log("📤 Sending request to server...");

        try {

            const response = await fetch("/request-rank", {
                method: "POST",
                body: formData
            });

            console.log("Server status:", response.status);

            const result = await response.json();

            console.log("Server response:", result);

            if (result.success) {

                alert("Request sent successfully!");

                form.reset();
                closeRequest();

            } else {

                alert(result.message || "Request failed.");

            }

        } catch (error) {

            console.error("❌ ERROR:", error);

            alert("Could not connect to server.");

        }

    });

});