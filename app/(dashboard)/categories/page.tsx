"use client";

import React, { useState, useEffect } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PieChart, Plus, Layers, Tag } from "lucide-react";
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

      <div className="space-y-6">
        {/* Segment Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide w-full max-w-full min-w-0">
          {SEGMENTS.map((seg) => {
            const active = activeSegment === seg;
            const count = (categoriesBySegment[seg] || []).length;
            return (
              <button
                key={seg}
                onClick={() => setActiveSegment(seg)}
                className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-colors ${
                  active
                    ? "bg-ink text-canvas shadow-sm"
                    : "bg-surface-card text-mute hover:text-ink hover:bg-secondary-bg border border-hairline"
                }`}
              >
                {seg} ({count})
              </button>
            );
          })}
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
                className="bg-surface-card border border-hairline rounded-[20px] p-5 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-canvas flex items-center justify-center border border-hairline shrink-0">
                    <Tag className="w-4 h-4 text-ink" />
                  </div>
                  <div>
                    <h4 className="font-bold text-ink text-sm">
                      {cat.category_name}
                    </h4>
                    <p className="text-[11px] text-mute font-medium">
                      Frekuensi: {cat.target_frequency || "Bulanan"}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs">
                  <span className="text-mute font-medium">Target Budget</span>
                  <span className="font-bold text-ink">
                    {cat.budget_target > 0 ? formatRupiah(cat.budget_target) : "Tanpa Limit"}
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
