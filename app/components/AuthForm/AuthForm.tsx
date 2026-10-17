import Form from 'next/form'

export default function AuthForm({ isLogin = false }){

    return(
            <Form 
                className='flex flex-col'
                action="#"
            > 
                {isLogin &&
                <>                
                    <label htmlFor="mail">Email</label>
                    <input type="text" name='mail' id='mail' autoComplete="email" required className='input'/>
                    <label htmlFor="password">Mot de passe</label>
                    <input type="password" name='password' id='password' autoComplete="current-password"  required className='input'/>
                    <button formMethod='post' className='button'>Se connecter</button>
                </>
                }
                {!isLogin && 
                <>
                    <label htmlFor="firstname">Pr&eacute;nom</label>
                    <input type="text" name='firstname' id='firstname' required className='input'/>
                    <label htmlFor="lastname">Nom</label>
                    <input type="text" name='lastname' id='lastname' required className='input'/>
                    <label htmlFor="mail">Email</label>
                    <input type="text" name='mail' id='mail' autoComplete="email" required className='input'/>
                    <label htmlFor="newPassword">Mot de passe</label>
                    <input type="password" name='newPassword' id='newPassword' autoComplete="current-password"  required className='input'/>
                    <button formMethod='post' className='button'>S&apos;inscrire</button>
                </>
                }

            </Form>

    ) 

}