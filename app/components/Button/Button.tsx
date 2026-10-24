
type ButtonProps = {
    label: string
    variant?:"primary" | "secondary" | "disabled"
}

export default function Button({label,variant = "primary"}:ButtonProps){
    return(
        <button type="submit" className={`button-${variant}`}>
            {label}
        </button>
    )
}