import type { CSSProperties, JSX } from 'react';

interface IconProps {
  size?: number;
  style?: CSSProperties;
}

function createIcon(path: JSX.Element): (props: IconProps) => JSX.Element {
  return function Icon({ size = 20, style }: IconProps): JSX.Element {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={style}
      >
        {path}
      </svg>
    );
  };
}

export const MenuIcon = createIcon(
  <>
    <path d="M4 7H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M4 12H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M4 17H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const HomeIcon = createIcon(
  <>
    <path d="M5 10.5L12 4L19 10.5V19A1 1 0 0 1 18 20H6A1 1 0 0 1 5 19V10.5Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 20V13H15V20" stroke="currentColor" strokeWidth="1.8" />
  </>,
);

export const LayersIcon = createIcon(
  <>
    <path d="M12 4L20 8L12 12L4 8L12 4Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M4 16L12 20L20 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const MessageIcon = createIcon(
  <>
    <path d="M6 7H18A2 2 0 0 1 20 9V14A2 2 0 0 1 18 16H10L6 19V16H6A2 2 0 0 1 4 14V9A2 2 0 0 1 6 7Z" stroke="currentColor" strokeWidth="1.8" />
  </>,
);

export const FileIcon = createIcon(
  <>
    <path d="M8 3H14L19 8V19A2 2 0 0 1 17 21H8A2 2 0 0 1 6 19V5A2 2 0 0 1 8 3Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M14 3V8H19" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 12H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M9 16H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const ChartIcon = createIcon(
  <>
    <path d="M5 19V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M12 19V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M19 19V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const SettingsIcon = createIcon(
  <>
    <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M19 12C19 11.5 18.94 11.01 18.82 10.54L20.6 9.2L18.8 6.08L16.68 6.76C15.95 6.12 15.07 5.65 14.1 5.42L13.78 3H10.22L9.9 5.42C8.93 5.65 8.05 6.12 7.32 6.76L5.2 6.08L3.4 9.2L5.18 10.54C5.06 11.01 5 11.5 5 12C5 12.5 5.06 12.99 5.18 13.46L3.4 14.8L5.2 17.92L7.32 17.24C8.05 17.88 8.93 18.35 9.9 18.58L10.22 21H13.78L14.1 18.58C15.07 18.35 15.95 17.88 16.68 17.24L18.8 17.92L20.6 14.8L18.82 13.46C18.94 12.99 19 12.5 19 12Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </>,
);

export const UsersIcon = createIcon(
  <>
    <path d="M8.5 12.5A3 3 0 1 0 8.5 6.5A3 3 0 0 0 8.5 12.5Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M15.5 11A2.5 2.5 0 1 0 15.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M4.5 18C5.15 15.83 7.03 14.5 9.2 14.5H10.1C12.27 14.5 14.15 15.83 14.8 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M14.5 17C14.91 15.81 15.94 15 17.15 15H17.4C18.52 15 19.49 15.71 19.9 16.78" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M16 16L20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const PlayIcon = createIcon(
  <path d="M8 6.5L18 12L8 17.5V6.5Z" fill="currentColor" />,
);

export const PlusIcon = createIcon(
  <>
    <path d="M12 5V19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M5 12H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const ChevronDownIcon = createIcon(
  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
);

export const CloseIcon = createIcon(
  <>
    <path d="M7 7L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M17 7L7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const SparklesIcon = createIcon(
  <>
    <path d="M12 3L13.8 8.2L19 10L13.8 11.8L12 17L10.2 11.8L5 10L10.2 8.2L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M18.5 3.5L19.2 5.3L21 6L19.2 6.7L18.5 8.5L17.8 6.7L16 6L17.8 5.3L18.5 3.5Z" fill="currentColor" />
  </>,
);

export const ImportIcon = createIcon(
  <>
    <path d="M12 4V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M8.5 10.5L12 14L15.5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 18H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const ClockIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 8V12.5L15 14.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </>,
);

export const DiamondSplitIcon = createIcon(
  <>
    <path d="M12 4L19 12L12 20L5 12L12 4Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 8V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const DatabaseIcon = createIcon(
  <>
    <ellipse cx="12" cy="6" rx="6.5" ry="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M5.5 6V12C5.5 13.66 8.41 15 12 15C15.59 15 18.5 13.66 18.5 12V6" stroke="currentColor" strokeWidth="1.8" />
    <path d="M5.5 12V18C5.5 19.66 8.41 21 12 21C15.59 21 18.5 19.66 18.5 18V12" stroke="currentColor" strokeWidth="1.8" />
  </>,
);

export const CursorClickIcon = createIcon(
  <>
    <path d="M7 5L16.5 13.5L12.5 14.5L11 19L7 5Z" fill="currentColor" />
    <path d="M17.8 5.5L18.8 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M20.5 8.2L22.5 7.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const KeyboardIcon = createIcon(
  <>
    <rect x="4" y="7" width="16" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M7 11H7.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M10 11H10.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M13 11H13.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M16 11H16.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M8 14H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export const GlobeIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4.5 12H19.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 4C14.3 6.05 15.61 8.94 15.61 12C15.61 15.06 14.3 17.95 12 20" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 4C9.7 6.05 8.39 8.94 8.39 12C8.39 15.06 9.7 17.95 12 20" stroke="currentColor" strokeWidth="1.8" />
  </>,
);

export const BellIcon = createIcon(
  <>
    <path d="M8 17H16L15 15V11C15 9.34 13.66 8 12 8C10.34 8 9 9.34 9 11V15L8 17Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M10.7 18.5C10.98 19.08 11.44 19.5 12 19.5C12.56 19.5 13.02 19.08 13.3 18.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </>,
);

export function MimicLogo({ size = 28, style }: IconProps): JSX.Element {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.36,
        background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 6px 18px rgba(15, 23, 42, 0.28)',
        ...style,
      }}
    >
      <svg width={size * 0.64} height={size * 0.64} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="5" height="14" rx="2.5" fill="#fff" fillOpacity="0.92" />
        <rect x="9.5" y="8" width="5" height="11" rx="2.5" fill="#fff" fillOpacity="0.7" />
        <rect x="16" y="4" width="5" height="15" rx="2.5" fill="#fff" fillOpacity="0.38" />
      </svg>
    </div>
  );
}

interface BadgeProps {
  tone: string;
  background: string;
  children: JSX.Element;
}

export function NodeBadge({ tone, background, children }: BadgeProps): JSX.Element {
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        display: 'grid',
        placeItems: 'center',
        color: tone,
        background,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4)',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}
