"use client";

import React, { useState, useEffect } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PieChart, Plus, Tag } from "lucide-react";
import { CategoryModal } from "@/components/modals/category-modal";
import { api, Category } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";

const SEGMENTS = ["Pengeluaran", "Tagihan", "Tabungan", "Liabilitas", "Pemasukan"] as const;

export default function CategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [categoriesBySegment, setCategoriesBySegment] = useState<Record<string, Category[]>>({});
  const [activeSegment, setActiveSegment] = useState<string>("Pengeluaran");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getCategories();
      setCategoriesBySegment(data);
    } catch (err) {
      console.error("Gagal memuat kategori:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentList = categoriesBySegment[activeSegment] || [];

  return (
    <PageShell
      title="Budget & Kategori"
      subtitle="Kelola pos pengeluaran, tagihan, dan tabungan keluarga"
    >
      <CategoryModal open={isModalOpen} setOpen={setIsModalOpen} />

      <div className="space-y-6 w-full max-w-full min-w-0">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segment Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide flex-1 min-w-0">
            {SEGMENTS.map((seg) => {
              const active = activeSegment === seg;
              const count = (categoriesBySegment[seg] || []).length;
              return (
                <button
                  key={seg}
                  type="button"
                  onClick={() => setActiveSegment(seg)}
                  aria-pressed={active}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 active:scale-95 ${
                    active
                      ? "bg-ink text-canvas shadow-xs"
                      : "bg-surface-card text-mute hover:text-ink hover:bg-secondary-bg border border-hairline"
                  }`}
                >
                  <span>{seg}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] tabular-nums font-bold ${
                    active ? "bg-canvas/20 text-canvas" : "bg-secondary-bg text-mute"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 rounded-full bg-primary hover:bg-primary-pressed text-primary-foreground font-bold flex items-center justify-center gap-1.5 text-xs shadow-[0_4px_12px_rgba(230,0,35,0.22)] transition-all shrink-0 self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Tambah Kategori</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <DashboardSkeleton />
        ) : currentList.length === 0 ? (
          <EmptyState
            icon={PieChart}
            title={`Belum Ada Kategori ${activeSegment}`}
            description="Tambahkan kategori baru untuk mencatat transaksi dengan rapi."
            actionLabel="Tambah Kategori"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentList.map((cat) => (
              <div
                key={cat.id}
                className="bg-surface-card border border-hairline rounded-2xl p-5 flex flex-col justify-between hover:border-ink/20 transition-all min-w-0"
              >
                <div className="flex items-center gap-3 mb-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-canvas flex items-center justify-center border border-hairline shrink-0">
                    <Tag className="w-4 h-4 text-ink" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-ink text-sm truncate">
                      {cat.category_name}
                    </h4>
                    <p className="text-[11px] text-mute font-medium truncate">
                      Frekuensi: {cat.target_frequency || "Bulanan"}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs">
                  <span className="text-mute font-medium">Target Budget</span>
                  <span className="font-bold text-ink tabular-nums">
                    {cat.budget_target > 0 ? formatRupiah(cat.budget_target) : "Belum diatur"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
