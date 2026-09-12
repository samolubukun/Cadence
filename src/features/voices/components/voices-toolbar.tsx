import { useState } from "react";
import { useQueryState } from "nuqs";
import { useDebouncedCallback } from "use-debounce";
import { Search, Sparkles } from "lucide-react";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { voicesSearchParams } from "@/features/voices/lib/params";

const POPULAR_FILTERS = [
  "All",
  "Audiobook",
  "Conversational",
  "Narrative",
  "Characters",
  "Meditation",
  "Podcast",
];

export function VoicesToolbar() {
  const [query, setQuery] = useQueryState(
    "query",
    voicesSearchParams.query
  );
  const [localQuery, setLocalQuery] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const debouncedSetQuery = useDebouncedCallback(
    (value: string) => setQuery(value),
    300,
  );

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    const filterTerm = cat === "All" ? "" : cat.toLowerCase();
    setLocalQuery(filterTerm);
    setQuery(filterTerm);
  };

  return (
    <div className="space-y-3 pb-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <InputGroup className="w-full max-w-md bg-card">
          <InputGroupAddon>
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search voices by name, style, or category..."
            value={localQuery}
            onChange={(e) => {
              setLocalQuery(e.target.value);
              debouncedSetQuery(e.target.value);
            }}
          />
        </InputGroup>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {POPULAR_FILTERS.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all cursor-pointer shrink-0 active:scale-95 ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border/70 bg-card hover:bg-muted/50 text-foreground"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};