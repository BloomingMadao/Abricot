type TagProps = {
    label:string,
    color:string
}
export default function Tag({label,color}:TagProps){
    return(
        <p className={`tag-${color}`}>{label}</p>
    )
}