import React, { useState, useRef, useEffect, useMemo } from "react";
import { Icon } from "../shared/Icon";

interface Option {
  value: string;
  label: string;
  flag?: string;
}

interface PhonePrefixSelectorProps {
  countries: any[];
  selectedCountry: string;
  phonePrefix: string;
  onCountryChange: (code: string) => void;
}

export const PhonePrefixSelector: React.FC<PhonePrefixSelectorProps> = ({
  countries,
  selectedCountry,
  phonePrefix,
  onCountryChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentCountry = useMemo(
    () => countries.find((c) => c.code === selectedCountry),
    [countries, selectedCountry]
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return countries;
    return countries.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneCode.includes(searchQuery)
    );
  }, [countries, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery("");
      setActiveIndex(-1);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) setIsOpen(true);
        else setActiveIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (isOpen && activeIndex >= 0) {
          onCountryChange(filteredOptions[activeIndex].code);
          setIsOpen(false);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 transition-colors rounded-l-2xl border-r border-white/10"
      >
        <span className="text-lg leading-none">{currentCountry?.flag || "🇨🇴"}</span>
        <span className="text-xs font-bold text-slate-300">{phonePrefix}</span>
        <Icon name="ChevronDown" size={10} className={`text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 left-0 w-64 bg-[#0b0e14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left">
          <div className="p-3 border-b border-white/5 bg-white/2">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Icon name="Search" size={12} />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar país o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-1.5 bg-slate-950/60 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/30 transition-all"
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto py-2 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((c, index) => (
                <li
                  key={c.code}
                  onClick={() => {
                    onCountryChange(c.code);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`px-4 py-2 text-xs flex items-center gap-3 cursor-pointer transition-colors ${
                    activeIndex === index || selectedCountry === c.code
                      ? "bg-cyan-500/10 text-cyan-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="font-mono opacity-50">+{c.phoneCode.replace("+", "")}</span>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-[10px] text-slate-600 text-center uppercase font-bold">Sin resultados</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
