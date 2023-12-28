import Menu from "./components/Menu/Menu";
import Nodes from "./components/node.components";
import { NodesProvider } from "./context/NodeContext";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const App = () => {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [scenarios, setScenarios] = useState([]);

  return (
    <BrowserRouter basename="/mc_viber">
      <div className="w-screen h-screen relative">
        <Routes>
          {scenarios?.map((scenario) => (
            <Route
              key={scenario.id}
              path={`/canvas/${scenario.id + 1}`}
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
