export default async function sendToWebhook(message) {
    if (typeof message == "string") {
        await fetch(
            process.env.UPDATES_WEBHOOK_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: message })
            }
        );
    } else {
        await fetch(
            process.env.UPDATES_WEBHOOK_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(message)
            }
        );
    }

}