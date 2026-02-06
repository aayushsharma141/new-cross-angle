import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "./lib/utils";
import { Button } from "./button";

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    siblingCount?: number;
}

export function Pagination({
    className,
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 1,
    ...props
}: PaginationProps) {
    const generatePagination = () => {
        // If total pages is small, show all
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

        const firstPageIndex = 1;
        const lastPageIndex = totalPages;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            const leftItemCount = 3 + 2 * siblingCount;
            const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
            return [...leftRange, "...", lastPageIndex];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            const rightItemCount = 3 + 2 * siblingCount;
            const rightRange = Array.from(
                { length: rightItemCount },
                (_, i) => totalPages - rightItemCount + i + 1
            );
            return [firstPageIndex, "...", ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            const middleRange = Array.from(
                { length: rightSiblingIndex - leftSiblingIndex + 1 },
                (_, i) => leftSiblingIndex + i
            );
            return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
        }

        return [];
    };

    const pages = generatePagination();

    return (
        <nav
            role="navigation"
            aria-label="pagination"
            className={cn("mx-auto flex w-full justify-center", className)}
            {...props}
        >
            <ul className="flex flex-row items-center gap-1">
                <li>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        aria-label="Go to previous page"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </li>

                {pages.map((page, i) => (
                    <li key={i}>
                        {page === "..." ? (
                            <span className="flex h-8 w-8 items-center justify-center">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </span>
                        ) : (
                            <Button
                                variant={page === currentPage ? "outline" : "ghost"}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onPageChange(page as number)}
                                aria-current={page === currentPage ? "page" : undefined}
                            >
                                {page}
                            </Button>
                        )}
                    </li>
                ))}

                <li>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        aria-label="Go to next page"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </li>
            </ul>
        </nav>
    );
}
