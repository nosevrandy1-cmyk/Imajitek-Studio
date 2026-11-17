import type { SVGAttributes } from "react";

interface SpriteIconProps extends Omit<SVGAttributes<SVGSVGElement>, "children"> {
  id: string;
}

export function SpriteIcon({ id, className = "ph-icon", ...rest }: SpriteIconProps) {
  return (
    <svg className={className} aria-hidden="true" {...rest}>
      <use href={`#${id}`} />
    </svg>
  );
}
