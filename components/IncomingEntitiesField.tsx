"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

type Props = {
  availableEntities: string[];
  selectedEntities?: string[];
};

export function IncomingEntitiesField({ availableEntities, selectedEntities = [] }: Props) {
  const [entities, setEntities] = useState(() => Array.from(new Set([...availableEntities, ...selectedEntities])));
  const [selected, setSelected] = useState(() => new Set(selectedEntities));
  const [newEntity, setNewEntity] = useState("");

  const sortedEntities = useMemo(
    () => [...entities].sort((first, second) => first.localeCompare(second, "ar")),
    [entities]
  );

  function toggle(entity: string) {
    setSelected((current) => {
      const next = new Set(current);

      if (next.has(entity)) {
        next.delete(entity);
      } else {
        next.add(entity);
      }

      return next;
    });
  }

  function addEntity() {
    const value = newEntity.trim();

    if (!value) {
      return;
    }

    setEntities((current) => (current.includes(value) ? current : [...current, value]));
    setSelected((current) => new Set([...current, value]));
    setNewEntity("");
  }

  return (
    <div className="md:col-span-2">
      <p className="mb-2 font-extrabold text-slate-800">الجهات</p>
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        {sortedEntities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {sortedEntities.map((entity) => {
              const checked = selected.has(entity);

              return (
                <button
                  key={entity}
                  type="button"
                  onClick={() => toggle(entity)}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-extrabold transition ${
                    checked
                      ? "bg-[#0f766e] text-white shadow-sm"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-[#eef8ff]"
                  }`}
                >
                  {entity}
                  {checked ? <X size={14} /> : null}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm font-semibold text-slate-500">لا توجد جهات محفوظة بعد.</p>
        )}

        <div className="grid gap-2 md:grid-cols-[1fr_auto]">
          <input
            value={newEntity}
            onChange={(event) => setNewEntity(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addEntity();
              }
            }}
            placeholder="إضافة جهة جديدة"
          />
          <button
            type="button"
            onClick={addEntity}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 font-extrabold text-white transition hover:bg-slate-700"
          >
            <Plus size={17} />
            إضافة
          </button>
        </div>
      </div>

      {[...selected].map((entity) => (
        <input key={entity} type="hidden" name="incomingEntities" value={entity} />
      ))}
    </div>
  );
}
