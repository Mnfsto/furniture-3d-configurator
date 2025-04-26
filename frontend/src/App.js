import { useEffect, useState } from "react";
import {Route, Routes} from "react-router";
import Configurator from "./components/Configurator";
import HomePage from "./components/HomePage";
import "./scss/style.scss"
import HomeHeader from "./components/HomeHeader";
function App() {
    const[state, setState] = useState(0);


    const callBackendAPI = async () => {
        try {
            const response = await fetch('http://localhost:5051/api/applications',)
                .then(res => res.json());
            console.log(response);
             (async ()=>{
                 await fetch("/api/user", {method:"POST", headers: {
                         'Content-Type': 'application/json'}, body: JSON.stringify({name: state}) })
                    .then((res) => res.json())
                     .then(data => {
                         console.log('Ответ от сервера:', data);
                    });
            })();
        } catch (error) {
            console.log(error)
        }
    };

    useEffect(() =>{
        callBackendAPI()
    },[state]);

    const click = () => {
        console.log("click",`${state}`);
        setState(state+1);
    }
  return (
    <div className="wrapper">
        <HomeHeader/>
      <h1>React Furniture Configurator Projec</h1>
        <button onClick={()=>click()}>Fetch</button>
        <Routes>
        <Route path="/customize/:productId" element={<Configurator />} />
        <Route path="/" element={<HomePage />} />
        </Routes>
    </div>
  );
}

export default App;
