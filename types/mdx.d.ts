declare module "*.mdx" {
  import type { ComponentType } from "react";

  export const frontmatter: unknown;
  const Component: ComponentType;
  export default Component;
}
