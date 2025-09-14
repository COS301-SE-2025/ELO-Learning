// Avatar tab icons using CSS custom properties

export const BodyIcon = ({ className = '' }) => (
  <svg viewBox="0 0 1000 1000" className={className}>
    <path
      fill="none"
      stroke="var(--color-foreground)"
      strokeMiterlimit="10"
      strokeWidth="50"
      d="M750,171.53v439.25c0,16.78-13.6,30.38-30.38,30.38h-74.95v93.84h9.13c17.1,0,32.58,6.93,43.78,18.14,11.21,11.21,18.14,26.69,18.14,43.79,0,34.2-27.72,61.92-61.92,61.92h-110.63c-12.34,0-22.35-10-22.35-22.35v-195.34h-41.39v195.34c0,12.34-10.01,22.35-22.35,22.35h-110.62c-34.2,0-61.92-27.72-61.92-61.92,0-17.1,6.93-32.58,18.14-43.79,11.21-11.21,26.69-18.14,43.79-18.14h9.13v-93.84h-75.21c-16.77,0-30.38-13.6-30.38-30.38V171.53c0-16.77,13.6-30.38,30.38-30.38h439.25c16.78,0,30.38,13.6,30.38,30.38Z"
    />
  </svg>
);

export const ColorIcon = ({ className = '' }) => (
  <svg viewBox="0 0 1000 1000" className={className}>
    <path
      fill="none"
      stroke="var(--color-foreground)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="50"
      d="M680.87,550.37c61.13,131.03-31.39,283.55-175.94,286.81-1.64.04-3.28.06-4.92.06s-3.29-.02-4.92-.06c-144.56-3.26-237.08-155.78-175.94-286.81l42.99-92.15,137.87-295.46,137.87,295.46,42.99,92.15Z"
    />
  </svg>
);

export const EyesIcon = ({ className = '' }) => (
  <svg viewBox="0 0 1000 1000" className={className}>
    <ellipse
      fill="none"
      stroke="var(--color-foreground)"
      strokeMiterlimit="10"
      strokeWidth="50"
      cx="269.77"
      cy="500"
      rx="191.97"
      ry="250"
    />
    <path
      fill="var(--color-foreground)"
      d="M269.77,408.34c-44.53,0-80.62,41.04-80.62,91.66s36.1,91.66,80.62,91.66,80.62-41.04,80.62-91.66-36.1-91.66-80.62-91.66ZM269.77,536.28c-20.04,0-36.28-16.24-36.28-36.28s16.24-36.28,36.28-36.28,36.28,16.24,36.28,36.28-16.24,36.28-36.28,36.28Z"
    />
    <ellipse
      fill="none"
      stroke="var(--color-foreground)"
      strokeMiterlimit="10"
      strokeWidth="50"
      cx="730.23"
      cy="500"
      rx="191.97"
      ry="250"
    />
    <path
      fill="var(--color-foreground)"
      d="M730.23,408.34c-44.53,0-80.62,41.04-80.62,91.66s36.1,91.66,80.62,91.66,80.62-41.04,80.62-91.66-36.1-91.66-80.62-91.66ZM730.23,536.28c-20.04,0-36.28-16.24-36.28-36.28s16.24-36.28,36.28-36.28,36.28,16.24,36.28,36.28-16.24,36.28-36.28,36.28Z"
    />
  </svg>
);

export const MouthIcon = ({ className = '' }) => (
  <svg viewBox="0 0 1000 1000" className={className}>
    <path
      fill="none"
      stroke="var(--color-foreground)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="50"
      d="M921.89,300c-11.75,222.89-196.06,400-421.89,400S89.86,522.89,78.11,300h843.78Z"
    />
    <path
      fill="var(--color-foreground)"
      stroke="var(--color-foreground)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="50"
      d="M713.17,638.62c-62.73,36.84-135.87,58.06-213.95,58.06-63.66,0-123.99-14.15-178.18-39.24,36.57-74.21,113.05-125.32,201.27-125.32,80.75,0,151.35,42.58,190.86,106.51Z"
    />
  </svg>
);

export const BackgroundIcon = ({ className = '' }) => (
  <svg viewBox="0 0 1000 1000" className={className}>
    <rect
      fill="none"
      stroke="var(--color-foreground)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="50"
      x="74.74"
      y="250"
      width="850.53"
      height="500"
    />
    <rect
      fill="none"
      stroke="var(--color-foreground)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="50"
      x="189.21"
      y="352.76"
      width="621.58"
      height="294.49"
    />
    <line
      stroke="var(--color-foreground)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="50"
      x1="74.74"
      y1="250"
      x2="189.21"
      y2="352.76"
    />
    <line
      stroke="var(--color-foreground)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="50"
      x1="74.74"
      y1="750"
      x2="189.21"
      y2="647.24"
    />
    <line
      stroke="var(--color-foreground)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="50"
      x1="810.79"
      y1="352.76"
      x2="925.26"
      y2="250"
    />
    <line
      stroke="var(--color-foreground)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="50"
      x1="810.79"
      y1="647.24"
      x2="925.26"
      y2="750"
    />
  </svg>
);

export const HatIcon = ({ className = '' }) => (
  <svg viewBox="0 0 1000 1000" className={className}>
    <path
      fill="none"
      stroke="var(--color-foreground)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="50"
      d="M772.9,570.36c61.85,21.15,99.68,49.49,99.68,80.65,0,65.42-166.81,118.46-372.58,118.46s-372.58-53.03-372.58-118.46c0-31.92,39.71-60.89,104.28-82.19"
    />
    <path
      fill="none"
      stroke="var(--color-foreground)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="50"
      d="M768.3,651h0c-177.22,34.33-359.38,34.33-536.59,0h0v-146.78c0-144.45,112.17-264.62,256.36-273.28,4.33-.26,8.33-.4,11.94-.4s7.61.14,11.94.4c144.19,8.66,256.36,128.83,256.36,273.28v146.78Z"
    />
  </svg>
);
