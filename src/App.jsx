import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Sidebar from "./Sidebar";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "completed", "shouldStudy"

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
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* SIDEBAR */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <Sidebar filter={filter} setFilter={setFilter} />
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <Routes>
            <Route path="/" element={<Dashboard filter={filter} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
