import { useEffect, useMemo, useState } from "react";

import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";

function cleanString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function getInitials(name: string): string {
    const parts = name
        .split(/\s+/)
        .map((part) => part[0])
        .filter(Boolean);

    if (parts.length === 0) return "A";
    if (parts.length === 1) return parts[0].toUpperCase();

    return `${parts[0]}${parts[1]}`.toUpperCase();
}

export function useAdminDisplayName() {
    const { user } = useAdminAuth();
    const [profileName, setProfileName] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchProfileName = async () => {
            if (!user?.id) {
                setProfileName(null);
                return;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", user.id)
                .maybeSingle();

            if (!isMounted) return;

            if (error) {
                setProfileName(null);
                return;
            }

            setProfileName(data?.full_name?.trim() || null);
        };

        void fetchProfileName();

        return () => {
            isMounted = false;
        };
    }, [user?.id]);

    const metadataName = cleanString(user?.user_metadata?.full_name);
    const emailHandle = user?.email?.split("@")[0]?.trim() || "";
    const fullName = profileName || metadataName || null;
    const displayName = fullName || emailHandle || "Admin";
    const avatarUrl = cleanString(user?.user_metadata?.avatar_url) || null;
    const initials = useMemo(() => getInitials(displayName), [displayName]);

    return {
        avatarUrl,
        displayName,
        emailHandle,
        fullName,
        initials,
        profileName,
    };
}
