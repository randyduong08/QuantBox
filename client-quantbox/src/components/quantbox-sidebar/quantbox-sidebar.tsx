'use client'

import React, {JSX, useState} from 'react';
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
    IconBrandTabler,
    IconSettings,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Link from "@/types/link";

export function QuantboxSidebar({children}: Readonly<{children: React.ReactNode;}>): JSX.Element {

    const links: Link[] = [
        {
            label: "Dashboard",
            href: "#",
            icon: (
                <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
        },
        {
            label: "Black-Scholes",
            href: "#",
            icon: ("📊")
        },
        {
            label: "Backtest",
            href: "#",
            icon: ("🅱")
        },
        {
            label: "Settings",
            href: "#",
            icon: (<IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />)
        }
    ];
    const[open, setOpen] = useState<boolean>(false);

    return(
        <>
            <div className={cn("mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800", "h-screen")}>
                <Sidebar open={open} setOpen={setOpen}>
                    <SidebarBody className={"justify-between gap-10"}>
                        <div className={"flex flex-1 flex-col overflow-x-hidden overflow-y-auto"}>
                            {open ? <Logo /> : <LogoIcon />}
                            <div className={"mt-8 flex flex-col gap-2"}>
                                {links.map((link, idx) => (<SidebarLink key={idx} link={link}/>))}
                            </div>
                        </div>
                    </SidebarBody>
                </Sidebar>
                {children}
            </div>
        </>
    );
}

export const Logo = () => {
    return (
        <>
            <a
                href={"#"}
                className={"relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"}
            >
                <div className={"h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white"}/>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={"font-medium whitespace-pre text-black dark:text-white"}
                >
                    QuantBox
                </motion.span>
            </a>
        </>
    );
};

export const LogoIcon = () => {
    return (
        <>
            <a
                href={"#"}
                className={"relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"}
            >
                <div className={"h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white"}/>
            </a>
        </>
    );
};