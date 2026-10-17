import Form from 'next/form'

export default function AuthForm({ isLogin = false }){


    return(
            <Form> 
                {isLogin &&
                <>                
                    <label htmlFor="mail">Email</label>
                    <input type="text" name='mail' id='mail' autoComplete="email" required/>
                    <label htmlFor="password">Mot de passe</label>
                    <input type="password" name='password' id='password' autoComplete="current-password"  required/>
                    <button formMethod='post'>Se connecter</button>
                </>
                }
                {!isLogin && 
                <>
                    <label htmlFor="firstname">Pr&eacute;nom</label>
                    <input type="text" name='firstname' id='firstname' required/>
                    <label htmlFor="lastname">Nom</label>
                    <input type="text" name='lastname' id='lastname' required/>
                    <label htmlFor="mail">Email</label>
                    <input type="text" name='mail' id='mail' autoComplete="email" required/>
                    <label htmlFor="password">Mot de passe</label>
                    <input type="password" name='password' id='password' autoComplete="current-password"  required/>
                    <button formMethod='post'>Se connecter</button>
                </>
                }

            </Form>

    ) 

}