import Sprite, { SpriteProps } from "../Sprite";
import styles from "./styles.module.scss";
import clsx from "clsx";

export type IconProps = Omit<SpriteProps, "src"> & {
  type: IconType;
  spinning?: boolean;
};
export default function Icon({ className, spinning, type, ...props }: IconProps) {
  if (spinning == null && type === "loading") spinning = true;
  className = clsx(spinning && styles.spinning, className);
  return <Sprite className={className} src={"/icons/" + type + ".png"} crisp {...props} />;
}

export function MakeIcon(type: IconType) {
  return function Icon(props: Omit<SpriteProps, "src">) {
    return <Sprite src={`/icons/${type}.png`} {...props} />;
  };
}

export const AllIconTypes = [
  "loading",
  "check",
  "cross",
  "eye",
  "nugget",
  "upload",
  "download",
  "view-grid",
  "view-list",
  "discord",
] as const;

export type IconType = (typeof AllIconTypes)[number];

export const LoadingIcon = MakeIcon("loading");
export const CheckIcon = MakeIcon("check");
export const CrossIcon = MakeIcon("cross");
export const EyeIcon = MakeIcon("eye");
export const NuggetIcon = MakeIcon("nugget");
export const UploadIcon = MakeIcon("upload");
export const DownloadIcon = MakeIcon("download");
export const ViewGridIcon = MakeIcon("view-grid");
export const ViewListIcon = MakeIcon("view-list");
export const DiscordIcon = MakeIcon("discord");
