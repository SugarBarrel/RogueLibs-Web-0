import { Tooltip as ReactTooltip } from "react-tooltip";

export type ReactTooltipProps = Parameters<typeof ReactTooltip>[0];
export type TooltipProps = Omit<ReactTooltipProps, "children" | "content"> &
  (
    | { content?: never; children: React.ReactNode | ReactTooltipProps["render"] }
    | { children?: never; content: string }
  );

export default function Tooltip({ ...props }: TooltipProps) {
  if ("children" in props && typeof props.children === "function") {
    props.render = props.children;
    props.children = undefined;
  }
  return ReactTooltip(props as ReactTooltipProps);
}
