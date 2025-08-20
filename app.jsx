import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { WebsimSocket, useQuery } from "@websim/use-query";
import { WorldRenderer } from "./WorldRenderer.js";
import { AIEngine } from "./AIEngine.js";
const room = new WebsimSocket();
function App() {
  const [selectedChunk, setSelectedChunk] = useState({ x: 0, y: 0 });
  const [aiCode, setAiCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const { data: userProfile, loading: userLoading } = useQuery(
    room.collection("user_profile").filter({ id: "current" })
  );
  const { data: chunks, loading: chunksLoading } = useQuery(
    room.collection("world_chunks")
  );
  const { data: leaderboard, loading: leaderboardLoading } = useQuery(
    room.query("SELECT u.username, p.claims, p.wins, p.losses, p.last_activity FROM public.user_profile p JOIN public.user u ON p.id = u.id ORDER BY p.wins DESC")
  );
  const worldRef = useRef(null);
  useEffect(() => {
    if (!userLoading && !userProfile) {
      initializeUser();
    }
  }, [userProfile, userLoading]);
  const initializeUser = async () => {
    const currentUser = await window.websim.getCurrentUser();
    await room.collection("user_profile").upsert({
      id: currentUser.id,
      username: currentUser.username,
      claims: 0,
      wins: 0,
      losses: 0,
      ai_code: '// Write your AI strategy here\nfunction decideAction(units, enemies, chunks) {\n    // Your AI logic here\n    return { action: "move", unit: 0, target: { x: 1, y: 0 } };\n}',
      last_activity: (/* @__PURE__ */ new Date()).toISOString()
    });
  };
  const saveAICode = async () => {
    const currentUser = await window.websim.getCurrentUser();
    await room.collection("user_profile").upsert({
      id: currentUser.id,
      ai_code: aiCode,
      last_activity: (/* @__PURE__ */ new Date()).toISOString()
    });
  };
  const runAI = async () => {
    setIsRunning(true);
    setLogs([]);
    const aiEngine = new AIEngine(room);
    await aiEngine.execute(aiCode, selectedChunk, (log) => {
      setLogs((prev) => [...prev.slice(-19), log]);
    });
    setIsRunning(false);
  };
  const claimChunk = async (x, y) => {
    const currentUser = await window.websim.getCurrentUser();
    await room.collection("world_chunks").upsert({
      id: `${x},${y}`,
      x,
      y,
      owner: currentUser.id,
      units: [],
      resources: Math.floor(Math.random() * 100),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-gray-900 text-white", children: /* @__PURE__ */ jsxDEV("div", { className: "flex h-screen", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "w-2/3 flex flex-col", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex-1 relative", children: /* @__PURE__ */ jsxDEV(
        WorldRenderer,
        {
          ref: worldRef,
          chunks: chunks || [],
          selectedChunk,
          onChunkClick: setSelectedChunk,
          onChunkClaim: claimChunk
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 88,
          columnNumber: 25
        },
        this
      ) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 87,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "h-48 bg-gray-800 border-t border-gray-700 overflow-y-auto", children: [
        /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-bold p-2 border-b border-gray-700", children: "Leaderboard" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 98,
          columnNumber: 25
        }, this),
        leaderboardLoading ? /* @__PURE__ */ jsxDEV("div", { className: "p-4", children: "Loading..." }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 100,
          columnNumber: 29
        }, this) : /* @__PURE__ */ jsxDEV("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxDEV("thead", { children: /* @__PURE__ */ jsxDEV("tr", { className: "border-b border-gray-700", children: [
            /* @__PURE__ */ jsxDEV("th", { className: "text-left p-2", children: "Player" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 105,
              columnNumber: 41
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "text-center p-2", children: "Claims" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 106,
              columnNumber: 41
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "text-center p-2", children: "Wins" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 107,
              columnNumber: 41
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "text-center p-2", children: "Losses" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 108,
              columnNumber: 41
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 104,
            columnNumber: 37
          }, this) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 103,
            columnNumber: 33
          }, this),
          /* @__PURE__ */ jsxDEV("tbody", { children: leaderboard?.map((player, idx) => /* @__PURE__ */ jsxDEV("tr", { className: "border-b border-gray-700", children: [
            /* @__PURE__ */ jsxDEV("td", { className: "p-2", children: [
              idx + 1,
              ". ",
              player.username
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 114,
              columnNumber: 45
            }, this),
            /* @__PURE__ */ jsxDEV("td", { className: "text-center p-2", children: player.claims }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 115,
              columnNumber: 45
            }, this),
            /* @__PURE__ */ jsxDEV("td", { className: "text-center p-2", children: player.wins }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 116,
              columnNumber: 45
            }, this),
            /* @__PURE__ */ jsxDEV("td", { className: "text-center p-2", children: player.losses }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 117,
              columnNumber: 45
            }, this)
          ] }, player.username, true, {
            fileName: "<stdin>",
            lineNumber: 113,
            columnNumber: 41
          }, this)) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 111,
            columnNumber: 33
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 102,
          columnNumber: 29
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 97,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 86,
      columnNumber: 17
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "w-1/3 bg-gray-800 border-l border-gray-700 flex flex-col", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "p-4 border-b border-gray-700", children: [
        /* @__PURE__ */ jsxDEV("h2", { className: "text-xl font-bold mb-2", children: "AI Programming" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 129,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-gray-400", children: "Write JavaScript to control your units" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 130,
          columnNumber: 25
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 128,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex-1 flex flex-col", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex-1 p-4", children: /* @__PURE__ */ jsxDEV(
          "textarea",
          {
            className: "w-full h-full bg-gray-900 border border-gray-600 rounded p-2 font-mono text-sm",
            value: aiCode,
            onChange: (e) => setAiCode(e.target.value),
            placeholder: "// Your AI code here"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 135,
            columnNumber: 29
          },
          this
        ) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 134,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "p-4 border-t border-gray-700", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2 mb-4", children: [
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: saveAICode,
                className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded",
                children: "Save Code"
              },
              void 0,
              false,
              {
                fileName: "<stdin>",
                lineNumber: 145,
                columnNumber: 33
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: runAI,
                disabled: isRunning,
                className: "px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded",
                children: isRunning ? "Running..." : "Run AI"
              },
              void 0,
              false,
              {
                fileName: "<stdin>",
                lineNumber: 151,
                columnNumber: 33
              },
              this
            )
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 144,
            columnNumber: 29
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "bg-gray-900 rounded p-2 h-32 overflow-y-auto", children: logs.map((log, idx) => /* @__PURE__ */ jsxDEV("div", { className: "text-xs text-gray-300", children: log }, idx, false, {
            fileName: "<stdin>",
            lineNumber: 162,
            columnNumber: 37
          }, this)) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 160,
            columnNumber: 29
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 143,
          columnNumber: 25
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 133,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 127,
      columnNumber: 17
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 84,
    columnNumber: 13
  }, this) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 83,
    columnNumber: 9
  }, this);
}
const root = createRoot(document.getElementById("root"));
root.render(/* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 176,
  columnNumber: 13
}));
