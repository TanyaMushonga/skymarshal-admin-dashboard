"use client";

import React, { useState, useEffect } from "react";
import { Violation, PaginatedResponse } from "@/types";
import {
  Search,
  Filter,
  Loader2,
  Eye,
  X,
  Play,
  Image as ImageIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

interface ViolationsClientProps {
  initialData: PaginatedResponse<Violation>;
}

export default function ViolationsClient({
  initialData,
}: ViolationsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [violations, setViolations] = useState<Violation[]>(
    initialData?.results || [],
  );
  const [pagination, setPagination] = useState({
    count: initialData?.count || 0,
    next: initialData?.next,
    previous: initialData?.previous,
  });
  const [loading, setLoading] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      const response = await api.get<any>(
        `/violations/events/?${params.toString()}`,
      );

      if (Array.isArray(response)) {
        setViolations(response);
        setPagination({
          count: response.length,
          next: null,
          previous: null,
        });
      } else if (
        response &&
        typeof response === "object" &&
        "results" in response
      ) {
        setViolations(response.results || []);
        setPagination({
          count: response.count || 0,
          next: response.next,
          previous: response.previous,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch violations");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [searchParams]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/violations?${params.toString()}`);
  };

  const openEvidenceModal = (violation: Violation) => {
    setSelectedViolation(violation);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "PROCESSED":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "CITATION_SENT":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "DISMISSED":
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Violations Management
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Review and manage traffic violations detected by the surveillance
            system.
          </p>
        </div>
      </div>

      <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by license plate..."
              className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border/60 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              value={searchParams.get("search") || ""}
              onChange={(e) => updateFilters("search", e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={searchParams.get("status") || ""}
              onChange={(e) => updateFilters("status", e.target.value)}
              className="px-4 py-3 bg-muted/30 border border-border/60 rounded-lg text-sm font-medium appearance-none outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="PROCESSED">Processed</option>
              <option value="CITATION_SENT">Citation Sent</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
            <select
              value={searchParams.get("violation_type") || ""}
              onChange={(e) => updateFilters("violation_type", e.target.value)}
              className="px-4 py-3 bg-muted/30 border border-border/60 rounded-lg text-sm font-medium appearance-none outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="">All Types</option>
              <option value="SPEEDING">Speeding</option>
              <option value="RED_LIGHT">Red Light</option>
              <option value="PARKING">Parking</option>
              <option value="OTHER">Other</option>
            </select>
            <button
              onClick={() => fetchData()}
              disabled={loading}
              className="p-3 rounded-lg bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-border/60"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Filter size={20} />
              )}
            </button>
          </div>
        </div>

        {loading && violations.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : violations.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      ID
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Fine Amount
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {violations.map((violation) => (
                    <tr
                      key={violation.id}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => openEvidenceModal(violation)}
                    >
                      <td className="py-4 px-4">
                        <span className="text-sm font-mono text-muted-foreground">
                          {violation.id.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-base font-bold text-foreground uppercase tracking-wide">
                          {violation.violation_type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-foreground line-clamp-2">
                          {violation.description}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                            violation.status,
                          )}`}
                        >
                          {violation.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-base font-bold text-amber-500">
                          ${parseFloat(violation.fine_amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-foreground">
                          {new Date(violation.created_at).toLocaleDateString()}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {new Date(violation.created_at).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEvidenceModal(violation);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-semibold"
                        >
                          <Eye size={16} />
                          View Evidence
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.count > violations.length && (
              <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-6">
                <p className="text-sm font-medium text-muted-foreground">
                  Showing {violations.length} of {pagination.count} violations
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const page =
                        parseInt(searchParams.get("page") || "1") - 1;
                      updateFilters("page", page.toString());
                    }}
                    disabled={!pagination.previous || loading}
                    className="px-4 py-2 rounded-lg border border-border/60 text-sm font-medium hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      const page =
                        parseInt(searchParams.get("page") || "1") + 1;
                      updateFilters("page", page.toString());
                    }}
                    disabled={!pagination.next || loading}
                    className="px-4 py-2 rounded-lg border border-border/60 text-sm font-medium hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No violations found
            </h3>
            <p className="text-base text-muted-foreground">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        )}
      </div>

      {/* Evidence Modal */}
      {isModalOpen && selectedViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-card border border-border/50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="text-2xl font-bold text-foreground">
                Violation Evidence
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-muted/30 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Violation Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Violation Type
                  </p>
                  <p className="text-base font-bold text-foreground uppercase">
                    {selectedViolation.violation_type.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                      selectedViolation.status,
                    )}`}
                  >
                    {selectedViolation.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Fine Amount
                  </p>
                  <p className="text-xl font-bold text-amber-500">
                    ${parseFloat(selectedViolation.fine_amount).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Date & Time
                  </p>
                  <p className="text-base font-medium text-foreground">
                    {new Date(selectedViolation.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Description
                </p>
                <p className="text-base text-foreground">
                  {selectedViolation.description}
                </p>
              </div>

              {/* Evidence Metadata */}
              {selectedViolation.evidence_meta &&
                Object.keys(selectedViolation.evidence_meta).length > 0 && (
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/30">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Evidence Details
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedViolation.evidence_meta.speed_detected && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Speed Detected
                          </p>
                          <p className="text-base font-bold text-red-500">
                            {selectedViolation.evidence_meta.speed_detected}{" "}
                            km/h
                          </p>
                        </div>
                      )}
                      {selectedViolation.evidence_meta.speed_limit && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Speed Limit
                          </p>
                          <p className="text-base font-medium text-foreground">
                            {selectedViolation.evidence_meta.speed_limit} km/h
                          </p>
                        </div>
                      )}
                      {selectedViolation.evidence_meta.location && (
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground">
                            Location
                          </p>
                          <p className="text-base font-medium text-foreground">
                            {selectedViolation.evidence_meta.location}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Video Clip */}
              {selectedViolation.video_clip && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Play size={16} className="text-primary" />
                    <p className="text-sm font-semibold text-foreground uppercase tracking-wider">
                      Video Evidence
                    </p>
                  </div>
                  <video
                    controls
                    className="w-full rounded-lg border border-border/50"
                    src={selectedViolation.video_clip}
                  >
                    Your browser does not support video playback.
                  </video>
                </div>
              )}

              {/* Image Snapshot */}
              {selectedViolation.image_snapshot && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ImageIcon size={16} className="text-primary" />
                    <p className="text-sm font-semibold text-foreground uppercase tracking-wider">
                      Image Snapshot
                    </p>
                  </div>
                  <img
                    src={selectedViolation.image_snapshot}
                    alt="Violation snapshot"
                    className="w-full rounded-lg border border-border/50"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
