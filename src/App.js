import './App.css';
import Emvalidation from './components/emvalidation';
import Navbar from './components/Navbar';
import EmailValidationExcel from './components/EmailValidationExcel';

function App() {
  return (
    <div className="App">
      <Navbar/>
      <Emvalidation/>
      <EmailValidationExcel/>
    </div>
  );
}

export default App;
