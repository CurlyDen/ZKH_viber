import Menu from "./components/Menu/Menu";
import Nodes from "./components/node.components";
import { NodesProvider } from "./context/NodeContext";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import axios from "axios";

const App = () => {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [scenarios, setScenarios] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/mc_viber/canvas"
        );

        if (response.status === 200) {
          const scenarioData = response.data.map((s) => ({
            title: s.title,
            id: s.id,
            blocks: s.blocks,
            links: s.links,
          }));

          setScenarios(scenarioData);
        } else {
          console.error("Failed to fetch scenarios:", response.statusText);
        }
      } catch (error) {
        console.error("Error during scenarios fetch:", error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <BrowserRouter>
      <div className="w-screen h-screen relative">
        <Routes>
          {scenarios?.map((scenario) => (
            <Route
              key={scenario.id}
              path={`/canvas/${scenario.id}`}
              element={
                <NodesProvider scenario={scenario}>
                  <Nodes scenario={scenario} setScenarios={setScenarios} />
                </NodesProvider>
              }
            />
          ))}

          <Route
            path="/"
            element={
              <Menu
                selectedScenario={selectedScenario}
                setSelectedScenario={setSelectedScenario}
                scenarios={scenarios}
                setScenarios={setScenarios}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
