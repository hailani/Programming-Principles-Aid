"use client";

import './globals.css'
import NavBar from './problems/navBar'
import { Providers } from './providers';
import { usePathname } from 'next/navigation';

/* Jayla - 
  RootLayout is the main layout wrapper for the entire Next.js application.
  Every page will be rendered inside this layout.
*/
export default function RootLayout({
children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  let navVariant = "default";
  if (pathname === "/modules") navVariant = "modules";
  else if (pathname === "/problems") navVariant = "problems";
  else if (pathname?.startsWith("/problems/")) navVariant = "workspace";

  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <Providers> 
        <NavBar variant={navVariant} />
        {children}
        </Providers>
      </body>
    </html>
  )
}

/* Purpose:
    Providers = Wraps the entire application in Chakra UI's provider.
    NavBar = displays the navigation bar at the top of every page.
    children = the placeholder where page-specific content is rendered; each page (modules, problems, etc.) loads here.
*/
