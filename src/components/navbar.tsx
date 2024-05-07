import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

// Define the ListItem component
const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";

export function Navbar() {
    return (
        <nav>
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <a href="https://linkedin.com/in/abhimanyus1997" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img src="images/DL.svg" className="h-12 filter invert" alt="Abhimanyu Singh" />
                    <div className="hidden md:block">
                        <span className="self-center text-3xl font-semibold whitespace-nowrap text-white dark:text-white">Abhimanyu's Portfolio</span>
                    </div>
                </a>

                {/* Navigation menu */}
                <div className="w-full md:block md:w-auto">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <Link href="/" passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Home
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/projects" passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Projects
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/blog" passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Blog/Publications
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuTrigger>About Me</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                        <li className="row-span-3">
                                            <NavigationMenuLink asChild>
                                                <a
                                                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                                    href="/files/Abhimanyu_Resume_v3.pdf"
                                                >
                                                    {/* You may need to import `Icons` */}
                                                    {/* <Icons.logo className="h-6 w-6" /> */}
                                                    <div className="mb-2 mt-1 text-lg font-medium">
                                                        Abhimanyu's Resume
                                                    </div>
                                                    <p className="text-sm leading-tight text-muted-foreground">
                                                        A Deep Learning & ML researcher & analyst from Jaipur, India specialized in field of Computer Vision and Generative AI
                                                    </p>
                                                </a>
                                            </NavigationMenuLink>
                                        </li>
                                        {/* List items should be wrapped in a separate div */}
                                        <div>
                                            <ListItem href="https://www.linkedin.com/in/abhimanyus1997" title="LinkedIn">
                                                Hire Me on LinkedIn
                                            </ListItem>
                                            <ListItem href="https://www.twitter.com/in/abhimanyus1997/" title="Twitter">
                                                Let's Connect Socially over Twitter
                                            </ListItem>
                                            <ListItem href="https://github.com/abhimanyus1997" title="GitHub">
                                                Collaborate with me on Open Source on GitHub
                                            </ListItem>
                                        </div>

                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            {/* <NavigationMenuItem>
                                <Link href="/contact" passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Contact
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem> */}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </div>
        </nav>
    );
}
