import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Typography";
import { useState } from "react";

export type ChartZoomProps<T> = {
  items: T[];
  className?: string;
  buttonClassName?: { active?: string; inactive?: string; button?: string };
  textClassName?: string;
  onChange: (data: T, index: number) => void;
  initialIndex?: number;
  dropdown?: boolean;
};

export const ChartZoom = <T extends { label: string }>({
  className,
  buttonClassName,
  textClassName,
  initialIndex,
  items,
  onChange,
  dropdown = false,
}: ChartZoomProps<T>) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex ?? 0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const buttonActive = buttonClassName?.active
    ? buttonClassName.active
    : "bg-green-primary dark:bg-green-primary-dark text-white dark:text-black";

  const buttonInactive = buttonClassName?.inactive
    ? buttonClassName.inactive
    : "bg-neutral-200 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-500";

  return dropdown ? (
    <div
      className={`${items ? "" : "hidden"} text-basic-12-150-regular relative`}
    >
      <button
        className="w-16 text-left px-2 h-7 border-[1px] border-neutral-200 dark:border-neutral-900 rounded-sm flex flex-row justify-between items-center"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <Text as="span" className="text-neutral-600">
          {items ? items[activeIndex].label : "Select"}
        </Text>
        <Icon
          name="Dropdown"
          className={`text-neutral-600 ui-disabled:text-neutral-400 w-4 h-4 ${
            isDropdownOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>
      {isDropdownOpen && (
        <div className="absolute mt-0.5 max-h-60 w-16 overflow-auto scrollbar rounded-sm focus:outline-none text-left bg-white dark:bg-black border-[1px] border-neutral-200 dark:border-neutral-900 divide-y-[1px] divide-neutral-200 dark:divide-neutral-900">
          {items?.map((option, index) => (
            <button
              key={option.label}
              className={`${
                option === items[activeIndex]
                  ? "bg-green-primary dark:bg-green-primary-dark text-white dark:text-black"
                  : "dark:text-white text-black"
              } px-2 py-1 w-full text-left`}
              onClick={async () => {
                await onChange(option, index);
                setActiveIndex(index);
                setIsDropdownOpen(false);
              }}
            >
              <Text as="span">{option?.label}</Text>
            </button>
          ))}
        </div>
      )}
    </div>
  ) : (
    <div
      className={`inline-flex h-8 gap-2 lg:gap-1 items-center w-fit max-w-full whitespace-nowrap ${className} ${
        items ? "" : "hidden"
      }`}
    >
      {items?.map((item, ix) => {
        const { label } = item;
        const isActive = ix === activeIndex;
        return (
          <button
            key={label}
            className={`${buttonClassName?.button ? buttonClassName.button : "px-2 py-[0.5px] lg:py-[1px] rounded"} ${
              isActive ? buttonActive : buttonInactive
            }`}
            onClick={async () => {
              await onChange(item, ix);
              setActiveIndex(ix);
            }}
          >
            <Text
              className={`${
                textClassName
                  ? textClassName
                  : "text-basic-10-145-regular lg:text-basic-14-145-regular"
              }`}
            >
              {label}
            </Text>
          </button>
        );
      })}
    </div>
  );
};
