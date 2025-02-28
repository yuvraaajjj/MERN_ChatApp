import { useState,useContext } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

function RegisterAndLoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [lastname, setLastname] = useState("");
    const [dob, setDob] = useState("");
    const [isLoginOrRegister, setIsLoginOrRegister] = useState("register")

    const { setUsername: setLoggedInUsername, setId} = useContext(UserContext)    


    async function handleSubmit(e) {
        e.preventDefault();
        const url = isLoginOrRegister === "register" ? "register" : "login"
        const payload = isLoginOrRegister === "register"
        ? { name, lastname, username, password, dob }
        : { username, password };
        const {data} = await axios.post(url, payload)
        setLoggedInUsername(username)
        setId(data._id)
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form onSubmit={handleSubmit} className="w-64 mx-auto mb-12">
                
                {isLoginOrRegister === "register" ?
                 <>
                    <h2 className="text-center text-xl font-bold mb-4">Register</h2>
                         <input 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            type="text" 
                            placeholder="Name" 
                            className="block w-full rounded-sm bg-white p-2 mb-2"
                            required
                        />

                        <input 
                            value={lastname} 
                            onChange={e => setLastname(e.target.value)}
                            type="text" 
                            placeholder="Last Name" 
                            className="block w-full rounded-sm bg-white p-2 mb-2"
                            required
                        /> 

                        <input 
                        type="text"
                        value={username} 
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Username"
                        className="block w-full rounded-sm bg-white p-2 mb-2"
                        required
                    />

                    <input 
                        type="password"
                        value={password} 
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        className="block w-full rounded-sm bg-white p-2 mb-2"
                        required
                    />

                     <input 
                        value={dob} 
                        onChange={e => setDob(e.target.value)} 
                        type="date" 
                        className="block w-full rounded-sm bg-white p-2 mb-2"
                        required
                    />

                    <button className="block w-full rounded-md bg-orange-200 p-1">
                        {isLoginOrRegister === "register" ? "Register" : "Login"}
                    </button>
                    <div className="text-center mt-2">
                        
                        {isLoginOrRegister === "register" && (
                            <div>
                                Already a member?
                                <button onClick={() => setIsLoginOrRegister("login")}>
                                    Login here
                                </button>
                            </div>
                        )}
                        
                        {isLoginOrRegister === "login" && (
                            <div>
                                Don't have an Account?
                                <button onClick={() => setIsLoginOrRegister("register")}>
                                    Register here
                                </button>
                            </div>
                        )}
                    </div>
                 </>
                  : <>
                    <h2 className="text-center text-xl font-bold mb-4">Login</h2>
                    
                        <input 
                        type="text"
                        value={username} 
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Username"
                        className="block w-full rounded-sm bg-white p-2 mb-2"
                        required
                    />

                    <input 
                        type="password"
                        value={password} 
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        className="block w-full rounded-sm bg-white p-2 mb-2"
                        required
                    />

                    <button className="block w-full rounded-md bg-orange-200 p-1">
                        {isLoginOrRegister === "register" ? "Register" : "Login"}
                    </button>
                    <div className="text-center mt-2">
                        
                        {isLoginOrRegister === "register" && (
                            <div>
                                Already a member?
                                <button onClick={() => setIsLoginOrRegister("login")}>
                                    Login here
                                </button>
                            </div>
                        )}
                        
                        {isLoginOrRegister === "login" && (
                            <div>
                                Don't have an Account?
                                <button onClick={() => setIsLoginOrRegister("register")}>
                                    Register here
                                </button>
                            </div>
                        )}
                    </div>

                  
                  </>}

                
            </form>
        </div>
    );
}

export default RegisterAndLoginForm;
