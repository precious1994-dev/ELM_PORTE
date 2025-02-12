import { useState, useRef, useEffect } from 'react';
import * as FaIcons from 'react-icons/fa';
import { Button } from './button';
import clsx from 'clsx';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const iconList = [
  'FaHeart',
  'FaStar',
  'FaHandHoldingHeart',
  'FaPrayingHands',
  'FaUsers',
  'FaHandsHelping',
  'FaCross',
  'FaBible',
  'FaChurch',
  'FaDove',
  'FaHandSparkles',
  'FaHandsWash',
  'FaLightbulb',
  'FaCompass',
  'FaBalanceScale',
];

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const SelectedIcon = (FaIcons as any)[value];

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
          {value}
        </span>
      </Button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-10 mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <div className="grid grid-cols-4 gap-1">
            {iconList.map((iconName) => {
              const Icon = (FaIcons as any)[iconName];
              return (
                <button
                  key={iconName}
                  onClick={() => {
                    onChange(iconName);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    'flex flex-col items-center gap-1 rounded-lg p-2 text-xs transition-colors',
                    value === iconName
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="truncate">{iconName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 