"use client";

const STARTER_PROMPTS = [
  "Build a modern SaaS landing page with a hero section, features, and pricing.",
  "Create a data dashboard for a fitness app with charts and activity tracking.",
  "Develop a personal portfolio with a clean dark theme and project gallery.",
  "Build a task management tool with drag-and-drop features."
];

interface StarterPromptsProps {
  onSelect: (prompt: string) => void;
}

export function StarterPrompts({ onSelect }: StarterPromptsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
      {STARTER_PROMPTS.map((prompt, i) => (
        <button
          key={i}
          onClick={() => onSelect(prompt)}
          className="p-4 text-left text-sm bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded-xl transition-all hover:border-blue-500/50 group"
        >
          <span className="text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
            {prompt}
          </span>
        </button>
      ))}
    </div>
  );
}
