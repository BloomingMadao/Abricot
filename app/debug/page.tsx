import Button from "@/app/components/Button/Button"
import Input from "@/app/components/Input/Input"


export default function Debug(){
    return(
    <div>
        <div>
            <h1>
                Button
            </h1>
            <Button 
                label="test primary"
             />
            <Button 
                label = "test"
                variant="secondary"
            />
            <Button 
                label="test disabled"
                variant="disabled"
            />
            <br/><br/> <hr />
        </div>
        <div>
            <h1>Input</h1>
            <Input
                label="test"
                id="test"
                type="text"
            />
            <Input
                label="date"
                id="date"
                type="date"
                variant="calendar"
            />

            

        </div>

    </div>
        

    )
}