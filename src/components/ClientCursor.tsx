"use client";

import { useEffect, useState } from "react";
import TargetCursor from "./TargetCursor";

export default function ClientCursor() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return <TargetCursor />;
}