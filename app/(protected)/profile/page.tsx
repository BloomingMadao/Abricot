import Input from "@/app/components/Input/Input"
import Button from "@/app/components/Button/Button"
import Alert from "@/app/components/Alert/Alert"
import { getProfile } from "@/app/lib/api"

 const responseUser = await getProfile()


    const { user } = responseUser.data
    // name peut être null (inscription sans nom) : on affiche alors l'email
    const name = user.name

    console.log(user);
    

export default async function Profile(){
    return(
        <div className="flex justify-center items-center flex-col w-[1251px] h-auto bg-white rounded-[10px] py-[40px] px-[59px] m-[41px]">
            <div>
                <h5>Mon compte</h5>
                <span className="text-grey-600 font-sans text-[16px]">{name}</span>
            </div>
            <form action="">
                <Input 
                    label="Nom"
                    id="lastname"
                    name="lastname"
                    type="text"
                    variant="default"
                />

                <Input 
                    label="Prénom"
                    id="fistname"
                    name="fistname"
                    type="text"
                    variant="default"
                />

                <Input 
                    label="Email"
                    id="mail"
                    name="mail"
                    type="email"
                    variant="default"
                />

                <Input
                    label="Mot de passe"
                    id="password"
                    name="password"
                    type="password"
                    variant="default"
                />
            </form>
            <Button
                label="Modifier les informations"
                variant="primary"
                type="submit"
            />
            
        </div>
    )
}