import type { ComponentPropsWithoutRef } from "react";

type SiteLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
};

export default function SiteLink({
  href,
  children,
  target = "_top",
  ...props
}: SiteLinkProps) {
  return (
    <a href={href} target={target} {...props}>
      {children}
    </a>
  );
}
