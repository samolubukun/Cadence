import { useState } from "react";
import { useQueryState } from "nuqs";
import { useDebouncedCallback } from "use-debounce";
import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { voicesSearchParams } from "@/features/voices/lib/params";

export function VoicesToolbar() {
  const [query, setQuery] = useQueryState(
    "query",
    voicesSearchParams.query
  );
  const [localQuery, setLocalQuery] = useState(query);

  const debouncedSetQuery = useDebouncedCallback(
    (value: string) => setQuery(value),
    300,
  );

  return (
    <div className="flex items-center justify-between gap-4 pb-2">
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
  );
};