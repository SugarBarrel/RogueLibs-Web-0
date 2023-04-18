import { Tooltip } from "react-tooltip";

type ITooltipController = Parameters<typeof Tooltip>[0];
type OmitProps = "isOpen" | "setIsOpen" | "clickable" | "openOnClick";
export type PopupProps = Omit<ITooltipController, OmitProps> & {
  open: [boolean, (isOpen: boolean) => void];
};

export default function Popup({ open, ...props }: PopupProps) {
  const [isOpen, setIsOpen] = open;
  return <Tooltip clickable openOnClick isOpen={isOpen} setIsOpen={v => v || setIsOpen(false)} {...props} />;
}
