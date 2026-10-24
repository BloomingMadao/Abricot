import Image from "next/image"
import LogoCalendar from "@/public/image/calendar.svg"

type InputProps = {
  label: string
  id: string
  variant?: "default" | "calendar" | "dropdown"
  type?: string
}

export default function Input({ label, id, variant = "default", type = "text" }: InputProps) {
  const isCalendar = variant === "calendar"
  const today = new Date().toLocaleDateString("en-CA")

  return (
    <div className="flex flex-col gap-2">
    <label htmlFor={id}>{label}</label>
    <div className="relative">
        <input
        id={id}
        name={id}
        type={type}
        className={`input-${variant} w-full h-[52px] rounded-md border border-gray-200 px-4`}
        min={isCalendar? today:undefined}
        max={isCalendar ? "2050-12-31" : undefined}
        />
        {isCalendar && (
        <Image
            src={LogoCalendar}
            alt=""
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        />
        )}
    </div>
    </div>
  )
}