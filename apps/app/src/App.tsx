import { BrowserRouter } from "react-router";
import { ToastContainer } from "react-toastify";

import { Router } from "./routers/router.tsx";

function App() {
  return (
    <>
      <>
        <ToastContainer />

        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </>
    </>
  );
}

export default App;
