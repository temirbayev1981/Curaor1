'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';

interface AddressSuggestion {
  id: string;
  placeName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  required?: boolean;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  required,
}: AddressAutocompleteProps) {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim().length < 3) {
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/maps/suggest?q=${encodeURIComponent(value)}`)
        .then((res) => res.json())
        .then((json: { data: { suggestions: AddressSuggestion[] } | null }) => {
          setSuggestions(json.data?.suggestions ?? []);
          setOpen(true);
        })
        .catch(() => setSuggestions([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const visibleSuggestions = value.trim().length >= 3 ? suggestions : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Input
        required={required}
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          onChange(next);
          if (next.trim().length < 3) {
            setSuggestions([]);
            setOpen(false);
          }
        }}
        onFocus={() => visibleSuggestions.length > 0 && setOpen(true)}
        placeholder={t('booking.addressPlaceholder')}
        autoComplete="off"
      />
      {open && visibleSuggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-surface shadow-xl">
          {visibleSuggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                onClick={() => {
                  onSelect(s);
                  setOpen(false);
                }}
              >
                {s.placeName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
