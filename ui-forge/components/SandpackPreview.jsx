'use client';

export default function SandpackPreview({ code }) {
  if (!code) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 bg-[#1a1a2e]">
        No code to render
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white">
      <iframe
        srcDoc={code} // <--- The Magic: Directly render the HTML string
        title="Preview"
        className="w-full h-full border-none"
        sandbox="allow-scripts" // Allow the vanilla JS to run
      />
    </div>
  );
}