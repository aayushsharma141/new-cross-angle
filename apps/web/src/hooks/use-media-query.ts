import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(false);

    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        const documentChangeHandler = () => setMatches(mediaQueryList.matches);

        // Initial check
        setMatches(mediaQueryList.matches);

        // Watch for changes
        mediaQueryList.addEventListener("change", documentChangeHandler);

        return () => {
            mediaQueryList.removeEventListener("change", documentChangeHandler);
        };
    }, [query]);

    return matches;
}
