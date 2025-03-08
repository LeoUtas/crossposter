import React from "react";
import Image from "next/image";
import styles from "./PlatformPreview.module.css";

interface PreviewProps {
    platform: "twitter" | "linkedin" | "bluesky";
    text: string;
    imageUrl: string | null;
    characterCount: number;
    links: Array<{
        url: string;
        title?: string;
        description?: string;
        image?: string;
    }>;
}

const PLATFORM_LIMITS = {
    twitter: 280,
    linkedin: 3000,
    bluesky: 300,
};

const PLATFORM_IMAGE_SPECS = {
    twitter: { width: 1200, height: 675 },
    linkedin: { width: 1200, height: 627 },
    bluesky: { width: 1000, height: 1000 },
};

export default function PlatformPreview({
    platform,
    text,
    imageUrl,
    characterCount,
    links,
}: PreviewProps) {
    const platformSpec = PLATFORM_IMAGE_SPECS[platform];
    const characterLimit = PLATFORM_LIMITS[platform];

    return (
        <div className={styles.previewContainer}>
            <div className={styles[`${platform}Preview`]}>
                {/* Platform Header */}
                <div className={styles.previewHeader}>
                    <div className={styles.platformIcon}>
                        {platform === "twitter" && "X"}
                        {platform === "linkedin" && "in"}
                        {platform === "bluesky" && "🦋"}
                    </div>
                    <div className={styles.characterCount}>
                        {characterCount}/{characterLimit}
                        {characterCount > characterLimit && (
                            <span className={styles.error}>
                                {" "}
                                Exceeds limit!
                            </span>
                        )}
                    </div>
                </div>

                {/* Post Content */}
                <div className={styles.previewContent}>
                    <div className={styles.previewText}>{text}</div>

                    {/* Image Preview with Aspect Ratio */}
                    {imageUrl && (
                        <div
                            className={styles.imagePreview}
                            style={{
                                aspectRatio: `${platformSpec.width}/${platformSpec.height}`,
                                position: "relative",
                            }}
                        >
                            <Image
                                src={imageUrl}
                                alt="Post image"
                                fill
                                style={{ objectFit: "cover" }}
                            />
                        </div>
                    )}

                    {/* Link Preview Cards */}
                    {links.map((link, index) => (
                        <div key={index} className={styles.linkPreview}>
                            {link.image && (
                                <div className={styles.linkImage}>
                                    <Image
                                        src={link.image}
                                        alt={link.title || "Link preview"}
                                        width={200}
                                        height={100}
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                            )}
                            <div className={styles.linkContent}>
                                <div className={styles.linkTitle}>
                                    {link.title}
                                </div>
                                <div className={styles.linkDescription}>
                                    {link.description}
                                </div>
                                <div className={styles.linkUrl}>{link.url}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
