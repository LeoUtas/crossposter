import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json(
                { error: "URL is required" },
                { status: 400 }
            );
        }

        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract metadata
        const title =
            $('meta[property="og:title"]').attr("content") ||
            $('meta[name="twitter:title"]').attr("content") ||
            $("title").text() ||
            "";

        const description =
            $('meta[property="og:description"]').attr("content") ||
            $('meta[name="twitter:description"]').attr("content") ||
            $('meta[name="description"]').attr("content") ||
            "";

        const image =
            $('meta[property="og:image"]').attr("content") ||
            $('meta[name="twitter:image"]').attr("content") ||
            "";

        return NextResponse.json({
            title: title.substring(0, 100),
            description: description.substring(0, 200),
            image,
        });
    } catch (error) {
        console.error("Error fetching link preview:", error);
        return NextResponse.json(
            { error: "Failed to fetch link preview" },
            { status: 500 }
        );
    }
}
