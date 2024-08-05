"use client";
import Link from "next/link";

import { Suspense, useEffect, useState } from "react";
import cx from "classnames";
import dynamic from "next/dynamic";
import { Icon } from "@/components/ui/Icon";
import { Tooltip } from "@/components/Tooltip";
import { Text } from "@/components/ui/Typography";

const NoSSRToggleTheme = dynamic(() => import("./ToggleTheme"), {
  ssr: false,
  loading: () => (
    <div className="mx-[12px] my-[7px] w-[18px] h-[18px] rounded-full  dark:bg-white  bg-black animate-pulse " />
  ),
});
export type HeaderLinkProps = {
  label: string;
  href: string;
  isDisabled?: boolean;
  hide?: boolean;
};

export type HeaderProps = {
  links: HeaderLinkProps[];
};

export const Header = ({ links }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    window.onscroll = function () {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
  }, []);

  return (
    <nav
      className={cx(
        "flex px-4 border-neutral-500  dark:border-neutral-800 sticky top-0 z-50 bg-[#EDFFEA] dark:bg-[#173A33] border-b border-background-dark/5 dark:border-background-light/10 transition",
        { "shadow-lg": scrolled }
      )}
    >
      <div className="md:px-4 lg:px-8 xl:px-16 py-2 flex grow gap-2 items-center justify-between">
        {/* Left container (logo) */}
        <Link href="/merkletree" passHref>
          <Icon name="Logo" size="lg" />
        </Link>
        {/* Header links */}
        <ul className="flex grow justify-center items-center gap-8 md:gap-14">
          {links.map((link) => {
            if (link.hide) return;
            return <HeaderLink key={link.label} {...link} />;
          })}
        </ul>
        {/* Right container */}
        <Suspense
          fallback={
            <div className="w-6 h-6 dark:bg-black bg-white animate-pulse" />
          }
        >
          <NoSSRToggleTheme />
        </Suspense>
      </div>
    </nav>
  );
};

const HeaderLink = ({ href, label, isDisabled = false }: HeaderLinkProps) => {
  if (isDisabled)
    return (
      <Tooltip tooltipText="Coming Soon!">
        <div className="hover:opacity-50 transform transition-opacity duration-200 cursor-not-allowed">
          <Text className="text-black dark:text-white text-basic-16-140-regular">
            {label}
          </Text>
        </div>
      </Tooltip>
    );

  return (
    <Link href={href} passHref>
      <Text className="text-black dark:text-white text-basic-16-140-regular">
        {label}
      </Text>
    </Link>
  );
};
