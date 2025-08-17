import React, { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function EdumallCombobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  label,
}: ComboboxProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-900">{label}</label>
      )}
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger
          className="inline-flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-none hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full"
        >
          <Select.Value placeholder={placeholder}>
            {options.find(option => option.value === value)?.label || placeholder}
          </Select.Value>
          <Select.Icon>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className="overflow-hidden bg-white rounded-md shadow-lg border border-gray-200"
            position="popper"
            align="start"
            side="bottom"
          >
            <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
              ▲
            </Select.ScrollUpButton>
            <Select.Viewport className="p-1">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex items-center px-8 py-2 rounded-sm text-sm text-gray-700 focus:bg-gray-100 focus:text-gray-900 outline-none select-none cursor-default"
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                    <Check className="w-4 h-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
              ▼
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
