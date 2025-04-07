import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function DateDropdown({
    dates,
    onDateChange,
}: {
    dates: string[],
    onDateChange: (date: string) => void
}) {
    return (
        <Select onValueChange={onDateChange} disabled={dates.length == 0}>
            <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a Date" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Dates</SelectLabel>
                    {
                        dates.length === 0 ? (
                            <SelectItem value="no-records">
                                No records available
                            </SelectItem>
                        ) : (
                            dates.map((date) => (
                                <SelectItem key={date} value={date}>
                                    {new Date(date).toLocaleDateString()}
                                </SelectItem>
                            ))
                        )
                    }
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}