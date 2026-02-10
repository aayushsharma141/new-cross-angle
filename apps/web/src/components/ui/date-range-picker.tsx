
"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format, subDays, startOfMonth, startOfYear } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function CalendarDateRangePicker({
    className,
    date,
    setDate,
}: {
    className?: string
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
}) {
    const [isOpen, setIsOpen] = React.useState(false)

    const handlePresetChange = (value: string) => {
        const today = new Date()
        switch (value) {
            case "today":
                setDate({ from: today, to: today })
                break
            case "yesterday":
                const yesterday = subDays(today, 1)
                setDate({ from: yesterday, to: yesterday })
                break
            case "last7":
                setDate({ from: subDays(today, 7), to: today })
                break
            case "last30":
                setDate({ from: subDays(today, 30), to: today })
                break
            case "thisMonth":
                setDate({ from: startOfMonth(today), to: today })
                break
            case "thisYear":
                setDate({ from: startOfYear(today), to: today })
                break
            default:
                break
        }
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-4 border-b">
                        <Select onValueChange={handlePresetChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select preset..." />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="yesterday">Yesterday</SelectItem>
                                <SelectItem value="last7">Last 7 days</SelectItem>
                                <SelectItem value="last30">Last 30 days</SelectItem>
                                <SelectItem value="thisMonth">This Month</SelectItem>
                                <SelectItem value="thisYear">This Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
