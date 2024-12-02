import BillSplitter from "./pages/billSplitter";
import logo from "/favicon.png";

function App() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-3xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="w-12 h-12 mr-4" />
            <h1 className="text-2xl font-bold mb-4">Bill Splitter</h1>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/sakshgupta/BillSplitter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black"
            >
              <img
                src="/github-icon.svg" // GitHub icon from public folder
                alt="GitHub"
                className="w-8 h-8" // Set desired size for the icon
              />
            </a>
            <a
              href="https://sakshgupta.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black"
            >
              <img
                src="/portfolio-icon.svg" // Portfolio icon from public folder
                alt="Portfolio"
                className="w-8 h-8" // Set desired size for the icon
              />
            </a>
          </div>
          {/* <h1 className="text-2xl font-bold mb-4">Bill Splitter</h1> */}
        </div>
        <BillSplitter />
      </div>
    </div>
  );
}

export default App;
