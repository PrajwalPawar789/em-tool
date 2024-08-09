import './App.css';
import Emvalidation from './components/emvalidation';
import Navbar from './components/Navbar';
import EmailValidationExcel from './components/EmailValidationExcel';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div className="App">
      <Navbar/>
      <Emvalidation/>
      <EmailValidationExcel/>
      {/* <Sidebar/> */}
    </div>
  );
}

export default App;
