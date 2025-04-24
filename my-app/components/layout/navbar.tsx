"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export function Navbar() {
    const pathname = usePathname();

    return (
        <div className="py-2 px-20 md:py-2 md:px-30 lg:py-2 lg:px-40 xl:py-2 xl:px-50 border-b flex flex-row justify-between">
            <div className="align-middle">
                <h1 className="text-lg font-thin ">
                    DRIVERSMART
                </h1>
            </div>
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <Link href="/analytics" legacyBehavior passHref>
                            <NavigationMenuLink
                                className={cn(
                                    navigationMenuTriggerStyle(),
                                    pathname === "/analytics" ? "text-foreground" : "text-foreground/50"
                                )}
                            >
                                Analytics
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href="/" legacyBehavior passHref>
                            <NavigationMenuLink
                                className={cn(
                                    navigationMenuTriggerStyle(),
                                    pathname === "/" ? "text-foreground" : "text-foreground/50"
                                )}
                            >
                                Dashboard
                            </NavigationMenuLink>

                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href="/realtime-monitoring" legacyBehavior passHref>
                            <NavigationMenuLink
                                className={cn(
                                    navigationMenuTriggerStyle(),
                                    pathname === "/realtime-monitoring" ? "text-foreground" : "text-foreground/50"
                                )}
                            >
                                Realtime Monitoring
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>

                </NavigationMenuList>
            </NavigationMenu>
        </div>
    )
}