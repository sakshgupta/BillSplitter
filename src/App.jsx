import { useState } from "react";
import BillSplitter from "./pages/billSplitter";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6">
        <BillSplitter />
      </div>
    </div>
  );
}

export default App;
