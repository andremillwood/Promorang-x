import { useId, useMemo, useState } from "react";
import { searchIsoCountries, isoCountryByCode } from "@promorang/shared";
import { Input } from "@/components/ui/input";

type CountryPickerProps = {
  id?: string;
  value: string | null;
  onChange: (code: string) => void;
  placeholder: string;
  noMatchLabel: string;
};

export function CountryPicker({ id, value, onChange, placeholder, noMatchLabel }: CountryPickerProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const listId = `${inputId}-countries`;
  const selected = isoCountryByCode(value);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => searchIsoCountries(query), [query]);
  const shown = query.trim() ? (selected && query === selected.name ? selected.name : query) : (selected?.name ?? "");

  return (
    <div className="relative">
      <Input
        id={inputId}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={open ? query : shown}
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
      />
      {open && query.trim() && (
        <ul id={listId} role="listbox" className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-background py-1 shadow-md">
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">{noMatchLabel}</li>
          ) : matches.map((country) => (
            <li key={country.code} role="option" aria-selected={country.code === value}>
              <button
                type="button"
                className="flex min-h-11 w-full items-center justify-between px-3 text-left text-sm hover:bg-muted"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(country.code);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <span>{country.name}</span>
                <span className="text-muted-foreground">{country.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
