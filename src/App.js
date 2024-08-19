import "./App.css";
import Emvalidation from "./components/emvalidation";
import Navbar from "./components/Navbar";
import EmailValidationExcel from "./components/EmailValidationExcel";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Feature from "./components/Feature";
import Support from "./components/Support";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Emvalidation />
                <EmailValidationExcel />
              </>
            }
          />
          <Route
            path="/feature"
            element={
              
              <>
                <Navbar />
                <Feature />
              </>
            }
          />
          <Route
            path="/support"
            element={
              
              <>
                <Navbar />
                <Support/>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;