"use client";

import { motion } from "framer-motion";
import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowRight, FileCheck, Shield, Zap } from "lucide-react";

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-16 md:pt-20 lg:pt-32 pb-16">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
            <div className="absolute bottom-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-[100px]" />

            <div className="container flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
                        <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                        v1.0 Now Live
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
                >
                    Master Your Documents with <span className="text-primary">Precision</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
                >
                    The all-in-one platform to convert, compress, and secure your PDF files.
                    Enterprise-grade security meets consumer-grade simplicity.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-10 flex flex-col gap-4 sm:flex-row"
                >
                    <Link href="#upload">
                        <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                            Start Converting <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href="/pricing">
                        <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                            View Pricing
                        </Button>
                    </Link>
                </motion.div>

                {/* Features Grid Mini */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-4xl w-full"
                >
                    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-background/50 backdrop-blur border border-border/50">
                        <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold">Lightning Fast</h3>
                        <p className="text-sm text-muted-foreground">Conversions in seconds, not minutes.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-background/50 backdrop-blur border border-border/50">
                        <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold">Secure & Private</h3>
                        <p className="text-sm text-muted-foreground">Files auto-deleted after 1 hour.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-background/50 backdrop-blur border border-border/50">
                        <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                            <FileCheck className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold">High Fidelity</h3>
                        <p className="text-sm text-muted-foreground">Original layout preserved perfectly.</p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
