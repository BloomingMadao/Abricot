import Button from "@/app/components/Button/Button"
import Input from "@/app/components/Input/Input"
import Tag from "@/app/components/Tag/Tag"
import MenuItems from "@/app/components/MenuItems/MenuItems"
import Loader from "../components/Loader/Loader"
import Chips from "../components/Chips/Chips"
import IconButton from "../components/IconButton/IconButton"

export default function Debug(){
    return(
    <div>
        <div>
            <h1>Chargement</h1>
            <Loader></Loader>
            <br /><br />
            <hr />
        </div>


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
            <Input label="Zone de texte" id="textarea-test" variant="textarea" rows={4} />
            <Input label="Case à cocher" id="checkbox-test" type="checkbox" />
            <Input
                label="Statut"
                id="status"
                variant="dropdown"
                options={[{ value: "TODO", label: "À faire" }, { value: "IN_PROGRESS", label: "En cours" }]}
            />
            <br/><br/> <hr />
        </div>

        <div>
            <h1>Tag</h1>
            <Tag 
                label="label"
                variant="success"
            />
            <Tag label="label" variant="error"></Tag>
            <Tag label="label" variant="warning"></Tag>
            <Tag label="label" variant="info"></Tag>
            <Tag label="label" variant="brand"></Tag>
            <Tag label="label" variant="grey"></Tag>

            <br /><br />
            <hr />
        </div>
        <div>
            <h1>Menu Items</h1>
            <MenuItems 
                label="Test"
                icon="folder"
                href=""
            
            />
            <MenuItems
                label="test2"
                icon="dashboard"
                href=""
            />
            <br /><br />
            <hr />
        </div>
        <div>
            <h1>Chips</h1>
            <Chips
                label="taches"
                type="tasks"
            />
            <Chips
                label="kanban"
                type="kanban"
            />
            <Chips
                label="projets"
                type="projects"
            />
            <br /><br />
            <hr />
        </div>
        <div className="flex flex-row gap-6">
            <h1>IconButton</h1>
            <IconButton
                variant="back"
                href="#"
                label="test du bouton retour"
            />
            <IconButton
                variant="more"
                href="#"
                label="test du bouton voir plus"
            />
            <br /><br />
            <hr />
        </div>

    </div>
        

    )
}