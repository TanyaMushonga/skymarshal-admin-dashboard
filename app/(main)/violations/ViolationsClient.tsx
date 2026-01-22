"use client";

import React, { useState } from "react";
import { Violation } from "@/types";
import {
  AlertCircle,
  CheckCircle2,
  Send,
  ExternalLink,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ViolationsClientProps {
  initialViolations: Violation[];
}

export default function ViolationsClient({
  initialViolations,
}: ViolationsClientProps) {
  const [violations] = useState<Violation[]>(initialViolations);
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return (
          <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold border border-red-500/20">
            NEW
          </span>
        );
      case "PROCESSED":
        return (
          <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20">
            PROCESSED
          </span>
        );
      case "CITATION_SENT":
        return (
          <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
            SENT
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-bold border border-slate-500/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Traffic Violations
          </h1>
          <p className="text-slate-400">
            Review and process automatically detected traffic offences.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-lg border border-amber-500/20 text-xs font-medium">
            <AlertCircle size={14} className="mr-2" /> 12 Unprocessed
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {violations.map((violation) => (
          <div
            key={violation.id}
            className="bg-slate-800/40 backdrop-blur-md rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row gap-6 hover:border-slate-700 transition-colors"
          >
            <div
              className="w-full md:w-64 h-40 relative group overflow-hidden rounded-lg cursor-pointer"
              onClick={() => router.push(`/violations/${violation.id}`)}
            >
              <img
                src={violation.image_snapshot}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                alt="violation evidence"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white transition-transform hover:scale-110">
                  <ExternalLink size={20} />
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/violations/${violation.id}`}
                      className="text-xl font-bold text-slate-100 hover:text-blue-400 transition-colors"
                    >
                      {violation.plate}
                    </Link>
                    {getStatusBadge(violation.status)}
                  </div>
                  <button className="text-slate-500 hover:text-slate-200 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-4 mb-3">
                  <div className="text-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                      Type
                    </p>
                    <p className="font-semibold text-slate-300">
                      {violation.violation_type}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                      Fine Amount
                    </p>
                    <p className="font-semibold text-emerald-500">
                      ${violation.fine_amount}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                      Timestamp
                    </p>
                    <p className="font-semibold text-slate-300">
                      {new Date(violation.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 bg-white/5 p-3 rounded-lg border border-white/5">
                  {violation.description}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                {violation.status === "NEW" && (
                  <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
                    <CheckCircle2 size={16} /> Mark Processed
                  </button>
                )}
                {violation.status === "PROCESSED" && (
                  <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-500/20">
                    <Send size={16} /> Send Citation
                  </button>
                )}
                <button className="px-4 py-2 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-sm font-bold transition-all">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
