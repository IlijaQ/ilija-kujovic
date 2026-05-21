import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DownloadResumePage from "./pages/DownloadResumePage";


function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/download-my-resume" element={<DownloadResumePage />} />
    </Routes>
  )
}

export default App
