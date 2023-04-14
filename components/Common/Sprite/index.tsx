import { MouseEventHandler, useId } from "react";
import styles from "./styles.module.scss";
import clsx from "clsx";

export type SpriteProps = {
  src: string;
  color?: string;
  width?: number;
  height?: number;
  size?: number;
  crisp?: boolean;
  alpha?: number;
  // ...props
  className?: string;
  style?: React.CSSProperties;
  onClick?: MouseEventHandler<SVGSVGElement>;
};
export default function Sprite({ src, color, width, height, size, crisp, alpha, ...props }: SpriteProps) {
  if (width == null) width = size ?? 32;
  if (height == null) height = size ?? 32;
  if (color == null) color = "white";

  const id = useId();

  return (
    <svg
      className={styles.svg}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={width}
      height={height}
      viewBox="0 0 16 16"
      {...props}
    >
      <defs>
        <filter id={id}>
          <feFlood result="flood" x="0" y="0" width="100%" height="100%" floodColor={color} floodOpacity="1" />
          <feComposite in="flood" in2="SourceGraphic" operator="arithmetic" k1="1" />
        </filter>
      </defs>

      <image
        className={clsx(styles.sprite, crisp && styles.crisp)}
        xlinkHref={src}
        style={{ filter: `url(#${id})`, opacity: alpha }}
      />
    </svg>
  );
}
