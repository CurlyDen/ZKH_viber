import React, { useState } from "react";
import { Link } from "react-router-dom";

const Menu = ({
  selectedScenario,
  setSelectedScenario,
  setScenarios,
  scenarios,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // const handleScenarioClick = async (scenario) => {
  //   setIsLoading(true);

  //   try {
  //     const response = await fetch(`/mc_viber/canvas/${scenario.id}`);
  //     if (response.ok) {
  //       const scenarioData = await response.json();
  //       setSelectedScenario(scenarioData);
  //     } else {
  //       console.error("Failed to fetch scenario data:", response.statusText);
  //     }
  //   } catch (error) {
  //     console.error("Error during scenario fetch:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Без базы
  const handleScenarioClick = (scenario) => {
    setSelectedScenario(scenario);
  };

  const handleCreateClick = () => {
    if (scenarios?.length < 8) {
      const scenario = {
        id: scenarios?.length || 0,
        nodes: [
          {
            id: "1",
            type: "start",
            position: { x: 0, y: 70 },
            data: { label: "Начало", description: "" },
            style: { backgroundColor: "#d1ffbd" },
          },
          {
            id: "2",
            type: "end",
            position: { x: 160, y: 70 },
            data: {
              label: "Конец",
              description: "",
            },
            style: { backgroundColor: "#d1ffbd" },
          },
        ],
        edges: [],
        title: "scenario " + (scenarios?.length || 0).toString(),
      };
      setScenarios((prevScenarios) => [...prevScenarios, scenario]);
    }
  };
  return (
    <div className="h-screen w-full bg-slate-300 flex flex-col items-center gap-2">
      <button
        className="px-4 py-2 mt-32 w-96 text-lg bg-slate-700 rounded-xl text-white transition-colors hover:bg-slate-600 mb-2"
        onClick={() => handleCreateClick()}
      >
        Создать сценарий
      </button>
      {scenarios?.map((scenario) => (
        <button
          key={scenario.id}
          className="px-6 py-2 w-[500px] text-lg bg-slate-800 rounded-2xl text-white transition-colors hover:bg-slate-600"
          onClick={() => handleScenarioClick(scenario)}
        >
          <Link to={`/canvas/${scenario.id + 1}`}>{`Сценарий ${
            scenario.id + 1
          }`}</Link>
        </button>
      ))}
      {isLoading && <p>Loading scenario data...</p>}
    </div>
  );
};

export default Menu;
