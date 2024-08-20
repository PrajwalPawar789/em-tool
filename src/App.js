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
              <PrivateRoute>
                <Navbar />
                <Emvalidation />
                <EmailValidationExcel />
              </PrivateRoute>
            }
          />
          <Route
            path="/feature"
            element={
              
              <PrivateRoute>
                <Navbar />
                <Feature />
              </PrivateRoute>
            }
          />
          <Route
            path="/support"
            element={
              
              <PrivateRoute>
                <Navbar />
                <Support/>
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;