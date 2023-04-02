import Sprite, { AnimatedSprite, AnimatedSpriteProps, SpriteProps } from "../Sprite";

export type IconProps = Omit<SpriteProps, "src"> & {
  type: IconType;
  animated?: boolean;
};
export default function Icon({ className, type, animated, ...props }: IconProps) {
  if (type in animatedIconTypes) {
    const anim = animatedIconTypes[type]!;
    if (animated === false) {
      return <Sprite className={className} src={anim[0][0]} crisp {...props} />;
    }
    return <AnimatedSprite className={className} src={anim[0]} crisp interval={anim[1]} {...props} />;
  }
  return <Sprite className={className} src={`/icons/${type}.png`} crisp {...props} />;
}

export function MakeIcon(type: IconType) {
  return function Icon(props: Omit<SpriteProps, "src">) {
    return <Sprite src={`/icons/${type}.png`} crisp {...props} />;
  };
}
export function MakeAnimatedIcon(type: IconType, frameCount: number, interval: number) {
  const srcs = Array.from({ length: frameCount }).map((_, i) => `/icons/${type}${i + 1}.png`);
  animatedIconTypes[type] = [srcs, interval];
  return function AnimatedIcon(props: Omit<AnimatedSpriteProps, "src" | "interval"> | { interval?: number }) {
    return <AnimatedSprite src={srcs} interval={interval} crisp {...props} />;
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
  "discord",
  "copy",
  "edit",
  "save",
  "link",
] as const;

export type IconType = (typeof AllIconTypes)[number];

const animatedIconTypes: Partial<Record<IconType, [srcs: string[], interval: number]>> = {};

export const LoadingIcon = MakeAnimatedIcon("loading", 4, 50);
export const CheckIcon = MakeIcon("check");
export const CrossIcon = MakeIcon("cross");
export const EyeIcon = MakeIcon("eye");
export const NuggetIcon = MakeIcon("nugget");
export const UploadIcon = MakeIcon("upload");
export const DownloadIcon = MakeIcon("download");
export const DiscordIcon = MakeIcon("discord");
export const CopyIcon = MakeIcon("copy");
export const EditIcon = MakeIcon("edit");
export const SaveIcon = MakeIcon("save");
export const LinkIcon = MakeIcon("link");
