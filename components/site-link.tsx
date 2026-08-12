import type { ComponentPropsWithoutRef } from "react";

type SiteLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
};

export default function SiteLink({
  href,
  children,
  ...props
}: SiteLinkProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
