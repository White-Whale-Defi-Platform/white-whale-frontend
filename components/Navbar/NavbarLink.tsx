import React, { FC } from "react";
import { chakra } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Link from "next/link";

type Props = {
  text: string;
  href: string;
};

const NavbarLink: FC<Props> = ({ text, href }) => {
  const { asPath } = useRouter();

  const wrapperStyle =
    asPath.startsWith(href)
      ? { color: "white", borderBottomColor: "white" }
      : { color: "brand.50" };

  return (
    <Link href={href} passHref>
      <chakra.a
        transition="0.2s all"
        fontWeight="500"
        px={2}
        py={2}
        fontSize="18px"
        whiteSpace="nowrap"
        _hover={{
          color: "white",
          borderBottomColor: "white",
        }}
        {...wrapperStyle}
      >
        {text}
      </chakra.a>
    </Link>
  );
};

export default NavbarLink;
