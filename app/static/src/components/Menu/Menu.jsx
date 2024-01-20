import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Menu = ({
  selectedScenario,
  setSelectedScenario,
  setScenarios,
  scenarios,
  isLoading,
  setIsLoading,
  fetchData,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleScenarioClick = async (scenario) => {
    setIsLoading(true);

    try {
      const response = await axios.get(
        `http://localhost:8000/mc_viber/canvas/${scenario.id}`
      );

      if (response.status === 200) {
        const scenarioData = response.data;
        console.log(response.data);
        await setSelectedScenario(scenarioData);
        navigate(`/canvas/${scenario.id}`);
      } else {
        console.error("Failed to fetch scenario data:", response.statusText);
      }
    } catch (error) {
      console.error("Error during scenario fetch:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    if (scenarios?.length < 8) {
      const newScenario = {
        id: scenarios?.length || 0,
        title: "scenario " + (scenarios?.length + 1 || 1).toString(),
        blocks: [
          {
            id: "-1",
            scenario_id: scenarios?.length || 0,
            title: "Начало",
            text: "",
            coords: { x: 0, y: 70 },
            style: { backgroundColor: "#d1ffbd" },
            type: "start",
            parent_id: null,
          },
          {
            id: "-2",
            scenario_id: scenarios?.length || 0,
            title: "Конец",
            text: "",
            coords: { x: 160, y: 70 },
            style: { backgroundColor: "#d1ffbd" },
            type: "end",
            parent_id: null,
          },
        ],
        links: [],
        functions: [],
      };
      setIsLoading(true);
      axios
        .post("http://localhost:8000/mc_viber/canvas", newScenario)
        .catch((error) => {
          console.error("Failed to create scenario:", error.message);
        })
        .finally(() => setIsLoading(false));
    }
    fetchData();
  };

  useEffect(() => {
    if (location.pathname === "/") fetchData();
  }, [location.pathname]);

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
          {!isLoading ? (
            scenario.title
          ) : (
            <div className="text-gray-500">{scenario.title}</div>
          )}
        </button>
      ))}
      {isLoading && <p>Loading scenario data...</p>}
    </div>
  );
};

export default Menu;
