import { MouseEventHandler } from "react";

export type SpriteProps = {
  src: string;
  color?: string;
  width?: number;
  height?: number;
  size?: number;
  // ...props
  className?: string;
  style?: React.CSSProperties;
  onClick?: MouseEventHandler<SVGSVGElement>;
};
export default function Sprite({ src, color, width, height, size, ...props }: SpriteProps) {
  if (width == null) width = size ?? 32;
  if (height == null) height = size ?? 32;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={width}
      height={height}
      style={{ flexShrink: 0 }}
      {...props}
    >
      <defs>
        <filter id="multiply-blend">
          <feFlood result="flood" x="0" y="0" width="100%" height="100%" floodColor={color ?? "white"} floodOpacity="1" />
          <feComposite in="flood" in2="SourceGraphic" operator="arithmetic" k1="1" />
        </filter>
      </defs>

      <image xlinkHref={src} width="100%" height="100%" style={{ filter: "url(#multiply-blend)", transition: "all 1s ease" }} />
    </svg>
  );
}
