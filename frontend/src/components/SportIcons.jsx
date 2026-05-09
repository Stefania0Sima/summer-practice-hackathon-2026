// Custom sport SVG icons — line style, 24x24 viewBox, matching lucide-react aesthetic
// Each accepts className and size props like Lucide icons

const defaultProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Icon({ children, className, size, ...rest }) {
  return (
    <svg
      {...defaultProps}
      width={size || defaultProps.width}
      height={size || defaultProps.height}
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function FootballIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </Icon>
  );
}

export function BasketballIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M4.93 4.93l14.14 14.14" />
      <path d="M19.07 4.93L4.93 19.07" />
      <path d="M12 2v20" />
    </Icon>
  );
}

export function TennisIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M18.36 5.64a9 9 0 0 1-1.77 12.72" />
      <path d="M5.64 5.64a9 9 0 0 0 1.77 12.72" />
    </Icon>
  );
}

export function VolleyballIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 0 0 20" />
      <path d="M2 12c2.8-1.6 6-2 10-1" />
      <path d="M22 12c-2.8-1.6-6-2-10-1" />
    </Icon>
  );
}

export function RunningIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="14" cy="4" r="2" />
      <path d="M6 20l3-7" />
      <path d="M9 13l2.5-2.5L14 13l4-5" />
      <path d="M9 13l-3-1" />
      <path d="M14 17l2 3" />
    </Icon>
  );
}

export function CyclingIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="6" cy="17" r="4" />
      <circle cx="18" cy="17" r="4" />
      <path d="M6 17l4-8h4l3 8" />
      <circle cx="12" cy="5" r="1.5" />
    </Icon>
  );
}

export function SwimmingIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="6" r="2" />
      <path d="M8 8v2l4 3" />
      <path d="M2 18c1.5-1 3-1.5 4.5-.5s3 1.5 4.5.5 3-1.5 4.5-.5 3 1.5 4.5.5" />
      <path d="M2 14c1.5-1 3-1.5 4.5-.5s3 1.5 4.5.5 3-1.5 4.5-.5 3 1.5 4.5.5" />
    </Icon>
  );
}

export function TableTennisIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="16" cy="8" r="3" />
      <path d="M10 10L3 17a2 2 0 0 0 0 2.83l1.17 1.17a2 2 0 0 0 2.83 0L14 14" />
    </Icon>
  );
}

export function BadmintonIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 2l2 6h-4l2-6z" />
      <circle cx="12" cy="10" r="2" />
      <path d="M12 12v9" />
      <path d="M9 21h6" />
      <path d="M7 4l5 4" />
      <path d="M17 4l-5 4" />
    </Icon>
  );
}

// Map sport IDs to icon components
export const SPORT_ICONS = {
  football: FootballIcon,
  basketball: BasketballIcon,
  tennis: TennisIcon,
  volleyball: VolleyballIcon,
  running: RunningIcon,
  cycling: CyclingIcon,
  swimming: SwimmingIcon,
  'table-tennis': TableTennisIcon,
  badminton: BadmintonIcon,
};

export function SportIcon({ sportId, ...props }) {
  const IconComponent = SPORT_ICONS[sportId];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
}
