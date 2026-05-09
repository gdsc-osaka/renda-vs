import { HashRouter, Route, Routes } from "react-router-dom";
import { PlayerPage } from "./pages/PlayerPage";
import { HostPage } from "./pages/HostPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PlayerPage />} />
        <Route path="/host" element={<HostPage />} />
        <Route path="*" element={<PlayerPage />} />
      </Routes>
    </HashRouter>
  );
}
