"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle"; // We'll build this next
import { Button } from "./ui/button"; // Assuming shadcn button exists or we style it
import { FileText, Menu } from "lucide-react";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <FileText className="h-6 w-6" />
                        <span className="hidden font-bold sm:inline-block">PDF SaaS</span>
                    </Link>
                    <nav className="flex items-center gap-6 text-sm">
                        <Link href="/pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">Pricing</Link>
                        <Link href="/features" className="transition-colors hover:text-foreground/80 text-foreground/60">Features</Link>
                        <Link href="/docs" className="transition-colors hover:text-foreground/80 text-foreground/60">API</Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    {/* Mobile Menu Placeholder - easy to add sheet later */}
                    <Button variant="ghost" className="md:hidden" size="icon"><Menu /></Button>

                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search or other items */}
                    </div>
                    <nav className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Log in</Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
