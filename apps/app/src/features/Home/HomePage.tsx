import { Button } from "@rocket/ui/Button";
import clsx from "clsx";
import { useState } from "react";

export const HomePage = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <p>test test test test test test hoge fuga piyo</p>
      <p className={clsx("text-2xl")}>{process.env.NODE_ENV}</p>

      <Button label="ふがhu" />
    </>
  );
};
