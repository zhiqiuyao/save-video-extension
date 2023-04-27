import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const { url, filename } = req.body
    chrome.downloads.download({
        url,
        filename
    })
}

export default handler
