import { useContext } from "react"
import RegisterAndLoginForm from "./Register"
import { UserContext } from "./UserContext"
import Chat from "./Chat"

export default function AppRoutes(){
    const {username, id} = useContext(UserContext)

    if(username){
        return <Chat />
    }

    return(
        <>
            <RegisterAndLoginForm/>
        </>
    )
}