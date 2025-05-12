'use client'

import React, {JSX, useState} from 'react';
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
    IconArrowLeft,
    IconBrandTabler,
    IconSettings,
    IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Link from "@/types/link";

export function QuantboxSidebar(): JSX.Element {

    const links: Link[] = [
        {
            label: "Black-Scholes",
            href: "#",
            icon: ("📊")
        },
        {
            label: "Backtest",
            href: "#",
            icon: ("B")
        },
        {
            label: "Settings",
            href: "#",
            icon: ("S")
        }
    ];

    return(
        <>
        </>
    );
}