import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Sidebar from "./Sidebar";
import AIChat from "./AIChat";
import MistakeBook from "./MistakeBook";
import Pomodoro from "./Pomodoro";
import MockExams from "./MockExams";
import Notebook from "./components/Notebook/Notebook";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "completed", "shouldStudy"
  const [showAIChat, setShowAIChat] = useState(false);
  const [openReportDefault, setOpenReportDefault] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* SIDEBAR */}
        <div className="w-full lg:w-[280px] shrink-0 border-b lg:border-r border-white/10 z-10">
          <Sidebar
            filter={filter}
            setFilter={setFilter}
            onAIClick={() => {
              setOpenReportDefault(false);
              setShowAIChat(true);
            }}
            onReportClick={() => {
              setOpenReportDefault(true);
              setShowAIChat(true);
            }}
          />
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto relative bg-[#f5f7fa]">
          <Routes>
            <Route path="/" element={
              filter === "mistakes" ? <MistakeBook /> :
                filter === "pomodoro" ? <Pomodoro /> :
                  filter === "mockExams" ? <MockExams /> :
                    filter === "notebook" ? <Notebook /> :
                      <Dashboard filter={filter} />
            } />
          </Routes>
        </div>

        {/* AI CHAT MODAL */}
        {showAIChat && (
          <AIChat
            defaultShowReport={openReportDefault}
            onClose={() => setShowAIChat(false)}
          />
        )}
      </div>
    </BrowserRouter>
  );
}
