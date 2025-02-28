import AppRoutes from "./Routes";
import axios from "axios";
import { UserContextProvider } from "./UserContext"; 


axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;
function App() {
  return (
    <UserContextProvider>
      <AppRoutes />
    </UserContextProvider>
  );
}

export default App;
