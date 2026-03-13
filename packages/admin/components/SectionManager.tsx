"use client";

import { useRef, useState } from "react";
import { ORDER_SECTION_LABELS, NON_ORDERABLE_SECTIONS } from "../config";
import { formatLabel } from "../utils";

export function CombinedSectionManager({
  sections,
  order,
  onChange,
  variant = "sidebar",
  customTitles = {},
}: {
  sections: Record<string, boolean>;
  order: string[];
  onChange: (field: string, value: unknown) => void;
  variant?: "sidebar" | "page";
  customTitles?: Record<string, string>;
}) {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const allOrderable = Object.keys(sections).filter((k) => !NON_ORDERABLE_SECTIONS.has(k));
  const fullOrder = [
    ...order,
    ...allOrderable.filter((k) => !order.includes(k)),
  ];

  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setDragging(index);
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newOrder = [...fullOrder];
      const [removed] = newOrder.splice(dragItem.current, 1);
      newOrder.splice(dragOverItem.current, 0, removed);
      onChange("order", newOrder);
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setDragging(null);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fullOrder.length) return;
    const newOrder = [...fullOrder];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    onChange("order", newOrder);
  };

  const toggleSection = (key: string) => {
    const newSections = { ...sections, [key]: !sections[key] };
    onChange("sections", newSections);
    if (!sections[key] && !order.includes(key)) {
      onChange("order", [...fullOrder.map((k) => (k === key ? key : k))]);
    }
  };

  if (variant === "page") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {fullOrder.map((item, index) => {
          const enabled = sections[item] !== false;
          return (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                background: enabled ? "#ffffff" : "#f9fafb",
                border: `1px solid ${dragging === index ? "#009968" : "#9ca3af"}`,
                borderRadius: "6px",
                cursor: "grab",
                userSelect: "none",
                opacity: enabled ? 1 : 0.5,
                transition: "all 0.15s",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <span style={{ color: "#9ca3af", fontSize: "1rem", flexShrink: 0 }}>⠿</span>
              <label style={{ position: "relative", display: "inline-flex", alignItems: "center", flexShrink: 0, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => toggleSection(item)}
                  style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  display: "block",
                  width: "32px",
                  height: "18px",
                  background: enabled ? "#009968" : "#d1d5db",
                  borderRadius: "9px",
                  position: "relative",
                  transition: "background 0.2s",
                }}>
                  <span style={{
                    position: "absolute",
                    top: "2px",
                    left: enabled ? "16px" : "2px",
                    width: "14px",
                    height: "14px",
                    background: "white",
                    borderRadius: "50%",
                    transition: "left 0.2s",
                  }} />
                </span>
              </label>
              <span style={{
                flex: 1,
                fontSize: "0.8rem",
                fontWeight: 500,
                color: enabled ? "#1d1d22" : "#9ca3af",
                textDecoration: enabled ? "none" : "line-through",
              }}>
                {ORDER_SECTION_LABELS[item] || (item.startsWith("custom_") ? `Custom: ${customTitles[item] || formatLabel(item.replace("custom_", ""))}` : formatLabel(item))}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", flexShrink: 0 }}>
                <button
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  style={{
                    background: "none",
                    border: "1px solid #d1d5db",
                    borderRadius: "3px",
                    color: index === 0 ? "#d1d5db" : "#6b7280",
                    fontSize: "0.55rem",
                    padding: "1px 5px",
                    cursor: index === 0 ? "not-allowed" : "pointer",
                    lineHeight: 1,
                  }}
                >
                  ▲
                </button>
                <button
                  onClick={() => moveItem(index, 1)}
                  disabled={index === fullOrder.length - 1}
                  style={{
                    background: "none",
                    border: "1px solid #d1d5db",
                    borderRadius: "3px",
                    color: index === fullOrder.length - 1 ? "#d1d5db" : "#6b7280",
                    fontSize: "0.55rem",
                    padding: "1px 5px",
                    cursor: index === fullOrder.length - 1 ? "not-allowed" : "pointer",
                    lineHeight: 1,
                  }}
                >
                  ▼
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="sb-order-list">
      {fullOrder.map((item, index) => {
        const enabled = sections[item] !== false;
        return (
          <div
            key={item}
            className={`sb-order-item${dragging === index ? " sb-order-dragging" : ""}${!enabled ? " sb-order-disabled" : ""}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
          >
            <span className="sb-order-grip">⠿</span>
            <label className="sb-order-toggle">
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => toggleSection(item)}
              />
              <span className={`sb-toggle-slider${enabled ? " sb-toggle-on" : ""}`} />
            </label>
            <span className={`sb-order-label${!enabled ? " sb-order-label-off" : ""}`}>
              {ORDER_SECTION_LABELS[item] || (item.startsWith("custom_") ? `Custom: ${customTitles[item] || formatLabel(item.replace("custom_", ""))}` : formatLabel(item))}
            </span>
            <div className="sb-order-arrows">
              <button
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                className="sb-order-arrow"
                title="Move up"
              >
                ▲
              </button>
              <button
                onClick={() => moveItem(index, 1)}
                disabled={index === fullOrder.length - 1}
                className="sb-order-arrow"
                title="Move down"
              >
                ▼
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
