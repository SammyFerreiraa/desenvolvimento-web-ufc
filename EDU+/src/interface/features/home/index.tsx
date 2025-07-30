"use client";

import { useQueryState } from "nuqs";

export const HomePage = () => {
   const [input, setInput] = useQueryState("input", {
      defaultValue: ""
   });

   return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
         <div className="w-full max-w-md space-y-4">
            <div className="text-center">
               <p className="text-lg break-all">{input || "Type something..."}</p>
            </div>
            <input
               type="text"
               placeholder="Type here..."
               value={input || ""}
               onChange={(e) => setInput(e.target.value)}
               className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
               aria-label="Input field"
            />
         </div>
      </div>
   );
};
