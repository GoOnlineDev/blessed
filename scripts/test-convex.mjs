import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
console.log("Convex URL:", url);

if (!url) {
    console.error("URL not found");
    process.exit(1);
}

const client = new ConvexHttpClient(url);

async function test() {
    try {
        console.log("Querying users...");
        const users = await client.query("users:list");
        console.log("Success! Users found:", users.length);
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

test();
