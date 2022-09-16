import React, { FC } from "react";
import { chakra } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Link from "next/link";

type Props = {
  text: string;
  href: string;
  onClick: () => void;
};

const DrawerLink: FC<Props> = ({ text, href, onClick }) => {
  const { asPath } = useRouter();

  const wrapperStyle =
    asPath === href
      ? { color: "brand.500", borderBottomColor: "brand.500" }
      : { color: "brand.50" };

  return (
    <Link href={href} passHref>
      <chakra.a
        transition="0.2s all"
        fontWeight="700"
        fontSize="1.15rem"
        display="block"
        px="2"
        py="3"
        whiteSpace="nowrap"
        _hover={{
          color: "brand.500",
          borderBottomColor: "brand.500",
        }}
        onClick={onClick}
        {...wrapperStyle}
      >
        {text}
      </chakra.a>
    </Link>
  );
};

export default DrawerLink;
