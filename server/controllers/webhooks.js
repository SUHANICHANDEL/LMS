import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
    try {
        console.log("\n🔹 Incoming Webhook Data:", JSON.stringify(req.body, null, 2));

        // Verify webhook (Comment out to test if webhook is received)
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        try {
            await whook.verify(JSON.stringify(req.body), {
                "svix-id": req.headers["svix-id"],
                "svix-timestamp": req.headers["svix-timestamp"],
                "svix-signature": req.headers["svix-signature"]
            });
            console.log("✅ Webhook Verified Successfully");
        } catch (verifyError) {
            console.error("❌ Webhook Verification Failed:", verifyError.message);
            return res.status(400).json({ success: false, message: "Webhook verification failed" });
        }

        const { data, type } = req.body;
        console.log("🔹 Event Type:", type);

        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0]?.email_address || "No email",
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    imageUrl: data.image_url || "No image"
                };

                console.log("📝 User Data To Insert:", userData);

                try {
                    const newUser = await User.create(userData);
                    console.log("✅ User Successfully Stored in MongoDB:", newUser);
                } catch (dbError) {
                    console.error("❌ MongoDB Insert Error:", dbError.message);
                    return res.status(500).json({ success: false, message: dbError.message });
                }

                return res.json({ success: true });
            }

            case "user.updated": {
                console.log("📝 Updating User:", data.id);
                const userData = {
                    email: data.email_addresses[0]?.email_address || "No email",
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    imageUrl: data.image_url || "No image"
                };

                try {
                    const updatedUser = await User.findByIdAndUpdate(data.id, userData, { new: true });
                    console.log("✅ User Updated:", updatedUser);
                } catch (dbError) {
                    console.error("❌ MongoDB Update Error:", dbError.message);
                    return res.status(500).json({ success: false, message: dbError.message });
                }

                return res.json({ success: true });
            }

            case "user.deleted": {
                console.log("🗑️ Deleting User:", data.id);
                try {
                    await User.findByIdAndDelete(data.id);
                    console.log("✅ User Deleted");
                } catch (dbError) {
                    console.error("❌ MongoDB Delete Error:", dbError.message);
                    return res.status(500).json({ success: false, message: dbError.message });
                }

                return res.json({ success: true });
            }

            default:
                console.warn("⚠️ Unhandled Event Type:", type);
                return res.status(400).json({ success: false, message: "Unhandled event type" });
        }

    } catch (error) {
        console.error("❌ Webhook Processing Error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};
