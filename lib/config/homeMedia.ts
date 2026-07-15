/**
 * Home (dashboard) background — edit `type` to switch styles.
 *
 * - `ambient` — dark gradient + subtle fitness line art (recommended)
 * - `image`   — photo from /public (e.g. /i1.jpg)
 * - `video`   — looped video (e.g. /v2.mp4)
 */
export type HomeMediaType = "ambient" | "video" | "image";

export interface HomeMediaConfig {
  type: HomeMediaType;
  videoSrc: string;
  videoOptions: string[];
  imageSrc: string;
  posterSrc?: string;
  objectPosition?: string;
  /** Scrim over photo/video only (50–85) */
  overlayOpacity?: number;
}

export const homeMediaConfig: HomeMediaConfig = {
  type: "ambient",
  videoSrc: "/v2.mp4",
  videoOptions: ["/v2.mp4", "/v3.mp4"],
  imageSrc: "/i1.jpg",
  posterSrc: undefined,
  objectPosition: "center center",
  overlayOpacity: 82,
};
