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

export const GlassesIcon = ({ className = '' }) => (
  <svg viewBox="0 0 1000 1000" className={className}>
    <circle
      fill="none"
      stroke="var(--color-foreground)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="50"
      cx="297.63"
      cy="490.66"
      r="137.26"
    />
    <circle
      fill="none"
      stroke="var(--color-foreground)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="50"
      cx="702.37"
      cy="490.66"
      r="137.26"
    />
    <path
      fill="none"
      stroke="var(--color-foreground)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="50"
      d="M434.89,490.66h0c39.84-24.9,90.39-24.9,130.22,0h0"
    />
  </svg>
);

export const MoustacheIcon = ({ className = '' }) => (
  <svg viewBox="0 0 1000 1000" className={className}>
    <path
      fill="var(--color-foreground)"
      d="M406.3,400.07c1.15,0,2.29.15,3.42.46,2.62.71,4.48,2.08,6.68,3.7,2.68,1.97,9.82,7.9,14.07,25.09,2.21,8.95,7.35,29.74-1.82,52.64-6.59,16.45-17.84,27.22-32.68,38.38-23.82,17.93-77.67,58.47-160.66,60.68-4.64.12-9.2.24-13.78.24-14.7,0-29.5-1.16-46.9-6.85-13.99-4.57-65.75-21.48-83.24-71.58-8.29-23.73-5.81-46.08-1.81-61.72.3-1.17,1.23-1.71,2.17-1.71,1.15,0,2.31.81,2.32,2.29.08,14.85,3.36,35.83,17.94,54.73,15.35,19.9,35.43,27.1,44.35,30.15,11.87,4.06,23.79,5.73,35.41,5.73,50.63,0,95.2-31.76,101.25-36.07,7.59-5.41,22.61-17.2,38.38-31.51,11.38-10.32,20.29-19.35,26.19-25.54,23.44-23.57,36.96-39.1,48.7-39.1"
    />
    <path
      fill="var(--color-foreground)"
      d="M593.7,400.07c11.74,0,25.26,15.53,48.7,39.1,5.9,6.19,14.81,15.22,26.19,25.54,15.77,14.31,30.79,26.1,38.38,31.51,6.05,4.31,50.62,36.07,101.25,36.07,11.62,0,23.55-1.67,35.41-5.73,8.91-3.05,29-10.25,44.34-30.15,14.58-18.9,17.85-39.88,17.94-54.73,0-1.47,1.17-2.29,2.32-2.29.94,0,1.87.54,2.17,1.71,4,15.64,6.48,38-1.81,61.72-17.49,50.09-69.26,67.01-83.25,71.58-17.4,5.69-32.2,6.85-46.9,6.85-4.58,0-9.15-.11-13.78-.24-82.98-2.21-136.83-42.75-160.66-60.68-14.83-11.16-26.09-21.93-32.68-38.38-9.17-22.91-4.03-43.7-1.82-52.64,4.25-17.19,11.39-23.12,14.07-25.09,2.2-1.61,4.06-2.98,6.68-3.7,1.13-.31,2.27-.46,3.42-.46"
    />
  </svg>
);
