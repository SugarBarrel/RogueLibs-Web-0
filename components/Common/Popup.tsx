import { Tooltip, TooltipProps } from "@components/Common";

type OmitProps = "clickable" | "openOnClick" | "isOpen" | "setIsOpen";
export type PopupProps = Omit<TooltipProps, OmitProps> & {
  open: [boolean, (isOpen: boolean) => void];
};

export default function Popup({ open: [isOpen, setIsOpen], ...props }: PopupProps) {
  return (
    <Tooltip
      clickable
      openOnClick
      isOpen={isOpen}
      setIsOpen={v => v || setIsOpen(false)}
      {...(props as TooltipProps)}
    />
  );
}
