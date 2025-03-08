export interface LinkPreviewData {
    url: string;
    title?: string;
    description?: string;
    image?: string;
}

export async function extractLinks(text: string): Promise<string[]> {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
}

export async function fetchLinkPreview(url: string): Promise<LinkPreviewData> {
    try {
        const response = await fetch("/api/link-preview", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch link preview");
        }

        const data = await response.json();
        return {
            url,
            title: data.title,
            description: data.description,
            image: data.image,
        };
    } catch (error) {
        console.error("Error fetching link preview:", error);
        return { url };
    }
}

export async function getLinkPreviews(
    text: string
): Promise<LinkPreviewData[]> {
    const links = await extractLinks(text);
    const previews = await Promise.all(links.map(fetchLinkPreview));
    return previews;
}
