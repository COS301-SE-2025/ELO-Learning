/**
 * Custom Type Declaration for react-katex
 *
 * Why this file exists:
 * - The react-katex library doesn't include TypeScript type definitions
 * - Without this file, TypeScript shows errors when importing from 'react-katex'
 * - This file tells TypeScript what the react-katex module exports and how to use it
 *
 * What this does:
 * - Declares the shape and props of InlineMath and BlockMath components
 * - Allows TypeScript to provide autocomplete and type checking for react-katex
 * - Prevents "implicitly has 'any' type" errors
 *
 * How it works:
 * - TypeScript automatically picks up .d.ts files in the project
 * - The 'declare module' syntax tells TypeScript about external libraries
 * - Now we can safely import and use react-katex components with type safety
 */

declare module 'react-katex' {
  import { ComponentType } from 'react';

  // Define the props that KaTeX components accept
  interface KatexProps {
    children?: string; // The math expression to render (alternative to 'math' prop)
    math?: string; // The math expression to render (alternative to 'children')
    block?: boolean; // Whether to render as block-level (true) or inline (false)
    errorColor?: string; // Color to display errors in (e.g., '#cc0000')
    renderError?: (error: Error) => React.ReactNode; // Custom error renderer function
    settings?: any; // KaTeX rendering settings/options
    as?: string; // HTML tag to render as (default: 'span' for inline, 'div' for block)
  }

  // Export the main components that react-katex provides
  export const InlineMath: ComponentType<KatexProps>; // For inline math expressions
  export const BlockMath: ComponentType<KatexProps>; // For block-level math expressions
}
