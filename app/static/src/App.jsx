import Menu from "./components/Menu/Menu";
import Nodes from "./components/node.components";
import { NodesProvider } from "./context/NodeContext";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import axios from "axios";

const App = () => {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [scenarios, setScenarios] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("https://app3.fundeus.bg/api_mc/canvas");

      if (response.status === 200) {
        const scenarioData = response.data.map((s) => ({
          title: s.title,
          id: s.id,
          nodes: s.blocks.map((b) => {
            return {
              id: b.id,
              data: {
                label: b.title,
                description: b.text,
                parentId: b.parent_id,
              },
              position: b.coords,
              type: b.type,
              style: b.style,
            };
          }),
          edges: s.links.map((l) => {
            return {
              id: l.id,
              label: l.text,
              parentId: l.parent_id,
              source: l.start,
              target: l.end,
              type: l.type,
            };
          }),
          functions: s.functions,
        }));
        setScenarios(scenarioData);
      } else {
        console.error("Failed to fetch scenarios:", response.statusText);
      }
    } catch (error) {
      console.error("Error during scenarios fetch:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log(scenarios);
  }, [scenarios]);

  return (
    <BrowserRouter>
      <div className="w-screen h-screen relative">
        <Routes>
          {scenarios?.map((scenario) => (
            <Route
              key={scenario.id}
              path={`/mc_viber/canvas/${scenario.id}`}
              element={
                <NodesProvider scenario={scenario}>
                  <Nodes scenario={scenario} setScenarios={setScenarios} />
                </NodesProvider>
              }
            />
          ))}

          <Route
            path="/mc_viber"
            element={
              <Menu
                selectedScenario={selectedScenario}
                setSelectedScenario={setSelectedScenario}
                scenarios={scenarios}
                setScenarios={setScenarios}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                fetchData={fetchData}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
