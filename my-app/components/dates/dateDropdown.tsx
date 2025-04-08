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
    selectedDriver,
    selectedDate
}: {
    dates: string[],
    onDateChange: (date: string) => void,
    selectedDriver: string | null,
    selectedDate: string | null
}) {
    console.log("Selected Date:", selectedDate);
    const placeholder = !selectedDriver
        ? "No driver selected"
        : dates.length === 0
            ? "No driving records"
            : "Select a date"
    return (
        <Select
            onValueChange={onDateChange}
            disabled={dates.length == 0}
            value={selectedDate || undefined}
            key={selectedDriver || 'no-driver'}
        >
            <SelectTrigger className="w-[250px]">
                <SelectValue placeholder={placeholder} />
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