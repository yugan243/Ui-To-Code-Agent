'use client';

import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackPreview as NativeSandpackPreview 
} from "@codesandbox/sandpack-react";
import { dracula } from "@codesandbox/sandpack-themes";

export default function SandpackPreview({ code }) {
  if (!code) return <div className="h-full flex items-center justify-center text-gray-400">No code to render</div>;

  // AGGRESSIVE CLEANING - Remove "use client" from anywhere in the code
  // Changed from ^ (start of string) to match anywhere in the code
  const cleanCode = code
    .replace(/["']?use\s+client["']?;?\s*/gi, "") // Remove all "use client" directives
    .trim();

  return (
    <div className="h-full w-full bg-white">
      <SandpackProvider
        template="react"
        theme={dracula}
        files={{
          "/App.js": {
            code: cleanCode,
            active: true
          }
        }}
        options={{
          externalResources: ["https://cdn.tailwindcss.com"],
          activeFile: "/App.js", 
          visibleFiles: ["/App.js"],
        }}
        customSetup={{
          dependencies: {
            "lucide-react": "latest",
            "clsx": "latest",
            "tailwind-merge": "latest"
          },
        }}
      >
        <SandpackLayout style={{ 
          height: "100%", 
          width: "100%", 
          border: "none", 
          borderRadius: 0,
          display: "flex", 
          flexDirection: "column",
          overflow: "hidden"
        }}>
          <NativeSandpackPreview 
            style={{ 
              height: "100%", 
              width: "100%",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }} 
            showOpenInCodeSandbox={false} 
            showRefreshButton={false}
            showNavigator={false}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}