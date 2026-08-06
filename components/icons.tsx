import type { ReactNode, SVGProps } from "react";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  size?: number;
  title?: string;
};

type IconPath = (props: IconProps) => ReactNode;

function Icon({ children, size = 24, title, ...props }: IconProps & { children: IconPath }) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="none"
      height={size}
      role={title ? "img" : undefined}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children(props)}
    </svg>
  );
}

const strokeProps = { stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.8 };

export function HomeIcon(props: IconProps) {
  return <Icon {...props}>{() => <><path d="m3.5 10.6 8.5-7 8.5 7" {...strokeProps} /><path d="M5.8 9.4v9.7a1 1 0 0 0 1 1h10.4a1 1 0 0 0 1-1V9.4" {...strokeProps} /><path d="M9.2 20.1v-5.4a2.8 2.8 0 0 1 5.6 0v5.4" {...strokeProps} /></>}</Icon>;
}

export function MapIcon(props: IconProps) {
  return <Icon {...props}>{() => <><path d="m4 5.1 5.1-2 5.8 2.3 5.1-2v15.5l-5.1 2-5.8-2.3-5.1 2z" {...strokeProps} /><path d="M9.1 3.1v15.5M14.9 5.4v15.5" {...strokeProps} /></>}</Icon>;
}

export function BadgeIcon(props: IconProps) {
  return <Icon {...props}>{() => <><path d="M12 2.6 14 5l3.1-.2.8 3 2.7 1.6-1.3 2.8 1.3 2.8-2.7 1.6-.8 3-3.1-.2-2 2.4-2-2.4-3.1.2-.8-3-2.7-1.6 1.3-2.8-1.3-2.8L6.1 7.8l.8-3L10 5z" {...strokeProps} /><path d="m9.2 12.3 1.8 1.8 3.8-4" {...strokeProps} /></>}</Icon>;
}

export function UserIcon(props: IconProps) {
  return <Icon {...props}>{() => <><circle cx="12" cy="8.3" r="3.1" {...strokeProps} /><path d="M5.4 20.2a6.6 6.6 0 0 1 13.2 0" {...strokeProps} /></>}</Icon>;
}

export function ChevronRightIcon(props: IconProps) {
  return <Icon {...props}>{() => <path d="m9 5 7 7-7 7" {...strokeProps} />}</Icon>;
}

export function ChevronDownIcon(props: IconProps) {
  return <Icon {...props}>{() => <path d="m6 9 6 6 6-6" {...strokeProps} />}</Icon>;
}

export function ChevronUpIcon(props: IconProps) {
  return <Icon {...props}>{() => <path d="m6 15 6-6 6 6" {...strokeProps} />}</Icon>;
}

export function SparkleIcon(props: IconProps) {
  return <Icon {...props}>{() => <><path d="m12 2.8 1.2 5.4L18.5 10l-5.3 1.8L12 17.2l-1.2-5.4L5.5 10l5.3-1.8z" {...strokeProps} /><path d="m19.4 15.2.6 2.3 2.1.7-2.1.7-.6 2.3-.6-2.3-2.1-.7 2.1-.7z" {...strokeProps} /></>}</Icon>;
}

export function VolumeIcon(props: IconProps) {
  return <Icon {...props}>{() => <><path d="M4 9.2v5.6h3.2l4 3.3V5.9l-4 3.3z" {...strokeProps} /><path d="M15 9a3.7 3.7 0 0 1 0 6M17.5 6.8a7.2 7.2 0 0 1 0 10.4" {...strokeProps} /></>}</Icon>;
}

export function ArrowLeftIcon(props: IconProps) {
  return <Icon {...props}>{() => <><path d="M19 12H5" {...strokeProps} /><path d="m11 6-6 6 6 6" {...strokeProps} /></>}</Icon>;
}

export function LockIcon(props: IconProps) {
  return <Icon {...props}>{() => <><rect height="9" rx="2" width="12" x="6" y="10" {...strokeProps} /><path d="M8.7 10V7.7a3.3 3.3 0 0 1 6.6 0V10" {...strokeProps} /><path d="M12 13.2v2.5" {...strokeProps} /></>}</Icon>;
}

export function CheckIcon(props: IconProps) {
  return <Icon {...props}>{() => <path d="m5 12.3 4.2 4.1L19 6.9" {...strokeProps} />}</Icon>;
}

export function StarIcon(props: IconProps) {
  return <Icon {...props}>{() => <path d="m12 3 2.7 5.6 6.2.9-4.5 4.4 1.1 6.2-5.5-2.9-5.5 2.9 1.1-6.2-4.5-4.4 6.2-.9z" {...strokeProps} />}</Icon>;
}

export function BookIcon(props: IconProps) {
  return <Icon {...props}>{() => <><path d="M4.3 5.4a2.2 2.2 0 0 1 2.2-2.2H12v16H6.5a2.2 2.2 0 0 0-2.2 2.2z" {...strokeProps} /><path d="M19.7 5.4a2.2 2.2 0 0 0-2.2-2.2H12v16h5.5a2.2 2.2 0 0 1 2.2 2.2z" {...strokeProps} /></>}</Icon>;
}

export function LeafIcon(props: IconProps) {
  return <Icon {...props}>{() => <><path d="M19.7 4.2C12.1 4.1 6.8 6.7 5.1 11c-1.3 3.4.5 6.7 3.9 7.1 4.9.6 8.3-3.3 10.7-13.9Z" {...strokeProps} /><path d="M4.3 20.1c2.1-4.5 5.1-7.1 9-8.8" {...strokeProps} /></>}</Icon>;
}

export function KeyIcon(props: IconProps) {
  return <Icon {...props}>{() => <><circle cx="8.2" cy="15.8" r="3.6" {...strokeProps} /><path d="m10.8 13.2 7.1-7.1M15.3 8.7l2 2M17.4 6.6l2 2" {...strokeProps} /></>}</Icon>;
}

export function ClockIcon(props: IconProps) {
  return <Icon {...props}>{() => <><circle cx="12" cy="12" r="8.5" {...strokeProps} /><path d="M12 7v5l3.4 2" {...strokeProps} /></>}</Icon>;
}

export function TrophyIcon(props: IconProps) {
  return <Icon {...props}>{() => <><path d="M8 4h8v5.2a4 4 0 0 1-8 0z" {...strokeProps} /><path d="M8 6H5.4v2.1a3.1 3.1 0 0 0 3.1 3.1M16 6h2.6v2.1a3.1 3.1 0 0 1-3.1 3.1M12 13.4V18M8.7 20h6.6M9.5 18h5" {...strokeProps} /></>}</Icon>;
}

export function HeartIcon(props: IconProps) {
  return <Icon {...props}>{() => <path d="M20 8.8c0 4.8-8 10-8 10S4 13.6 4 8.8A4.1 4.1 0 0 1 12 7a4.1 4.1 0 0 1 8 1.8Z" {...strokeProps} />}</Icon>;
}

export function SettingsIcon(props: IconProps) {
  return <Icon {...props}>{() => <><circle cx="12" cy="12" r="2.7" {...strokeProps} /><path d="M19 13.7a7.7 7.7 0 0 0 0-3.4l2-1.3-1.8-3.1-2.2 1a8 8 0 0 0-2.9-1.7L13.8 3H10.2l-.3 2.2A8 8 0 0 0 7 6.9l-2.2-1L3 9l2 1.3a7.7 7.7 0 0 0 0 3.4l-2 1.3L4.8 18l2.2-1a8 8 0 0 0 2.9 1.7l.3 2.2h3.6l.3-2.2a8 8 0 0 0 2.9-1.7l2.2 1 1.8-3.1z" {...strokeProps} /></>}</Icon>;
}

export function PlayIcon(props: IconProps) {
  return <Icon {...props}>{() => <path d="m9.2 6.3 8 5.7-8 5.7z" fill="currentColor" />}</Icon>;
}

export function CompassIcon(props: IconProps) {
  return <Icon {...props}>{() => <><circle cx="12" cy="12" r="8.4" {...strokeProps} /><path d="m14.9 9.1-1.7 4.1-4.1 1.7 1.7-4.1z" {...strokeProps} /></>}</Icon>;
}

export function BoltIcon(props: IconProps) {
  return <Icon {...props}>{() => <path d="m13.6 2.9-7 10h5.1l-.7 8.2 7.4-10.8h-5.2z" {...strokeProps} />}</Icon>;
}

export function TargetIcon(props: IconProps) {
  return <Icon {...props}>{() => <><circle cx="12" cy="12" r="8.5" {...strokeProps} /><circle cx="12" cy="12" r="4.6" {...strokeProps} /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></>}</Icon>;
}

export function MessageIcon(props: IconProps) {
  return <Icon {...props}>{() => <><path d="M4.2 5.5a2 2 0 0 1 2-2h11.6a2 2 0 0 1 2 2v8.1a2 2 0 0 1-2 2h-6l-4.3 4v-4H6.2a2 2 0 0 1-2-2z" {...strokeProps} /><path d="M8 9h8M8 12h5" {...strokeProps} /></>}</Icon>;
}

export function CloseIcon(props: IconProps) {
  return <Icon {...props}>{() => <><path d="m6 6 12 12M18 6 6 18" {...strokeProps} /></>}</Icon>;
}

export function SparkleBurstIcon(props: IconProps) {
  return <Icon {...props}>{() => <><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" {...strokeProps} /><circle cx="12" cy="12" r="3.5" {...strokeProps} /></>}</Icon>;
}
