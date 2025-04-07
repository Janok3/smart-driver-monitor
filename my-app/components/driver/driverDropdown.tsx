import { Driver } from "@/lib/types"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function DriverDropdown({
    drivers,
    onDriverChange,
}: {
    drivers: Driver[],
    onDriverChange: (driverId: string) => void
}) {
    return (
        <Select onValueChange={onDriverChange}>
            <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a Driver" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Drivers</SelectLabel>
                    {
                        drivers.map((driver) => (
                            <SelectItem key={driver.driver_id} value={driver.driver_id}>
                                {driver.driver_id} - {driver.car_plate_number}
                            </SelectItem>
                        ))
                    }
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}