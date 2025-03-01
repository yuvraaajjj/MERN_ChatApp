import AppRoutes from "./Routes";
import axios from "axios";
import { UserContextProvider } from "./UserContext"; 


axios.defaults.baseURL = "https://mern-chatapp-backend-k8vl.onrender.com";
axios.defaults.withCredentials = true;
function App() {
  return (
    <UserContextProvider>
      <AppRoutes />
    </UserContextProvider>
  );
}

export default App;
