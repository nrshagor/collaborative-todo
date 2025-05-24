"use client";
import React, { useEffect, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  NavbarContent,
  NavbarItem,
  Button,
} from "@heroui/react";
import Link from "next/link";
import LogoutButton from "../buttons/LogoutButton";
import { auth } from "@/app/utils/jwt";
import { usePathname } from "next/navigation";

const Nav = () => {
  const [userid, setUserid] = useState<string | null>(null);
  const path = usePathname();
  // Get user ID
  useEffect(() => {
    const userIdFromAuth = auth()?.id;
    setUserid(userIdFromAuth ? String(userIdFromAuth) : null);
  }, [path]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { item: "home", path: "/" },
    { item: "Dashboard", path: "/dashboard" },
  ];

  return (
    <Navbar
      shouldHideOnScroll
      disableAnimation={true}
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent className="sm:hidden " justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        />
      </NavbarContent>

      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <p className="font-bold text-inherit">ToDo App</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarBrand>
          <p className="font-bold text-inherit">ToDo App</p>
        </NavbarBrand>
        <NavbarItem>
          <Link color="foreground" href="/">
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/dashboard">
            Dashboard
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {userid ? (
          <LogoutButton />
        ) : (
          <>
            <NavbarItem className="hidden lg:flex">
              <Link href="login">Login</Link>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} color="warning" href="register" variant="flat">
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}

        {/*DarkMood component */}
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              color={
                index === 2
                  ? "warning"
                  : index === menuItems.length - 1
                  ? "danger"
                  : "foreground"
              }
              href={item.path}>
              {item.item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
};

export default Nav;
