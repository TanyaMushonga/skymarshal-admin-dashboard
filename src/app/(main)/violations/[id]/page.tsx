import { server } from "@/lib/server-api";
import { Violation } from "@/types";
import { notFound } from "next/navigation";
import {
  AlertCircle,
  User,
  Car,
  Calendar,
  DollarSign,
  Shield,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default async function ViolationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let violation: Violation | null = null;
  try {
    violation = await server.get<Violation>(`/violations/${params.id}/`);
  } catch (error) {
    console.error("Failed to fetch violation:", error);
  }

  if (!violation) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/violations"
        className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors w-fit"
      >
        <ChevronLeft size={16} /> Back to Violations
      </Link>

      <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-800">
        <div className="relative h-64 md:h-96 w-full">
          <img
            src={violation.image_snapshot}
            alt="Violation Snapshot"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
            <div>
              <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-500 text-[10px] font-bold border border-red-500/20 mb-2 inline-block">
                {violation.violation_type}
              </span>
              <h1 className="text-3xl font-bold text-white tracking-widest">
                Violation Details
              </h1>
              <p className="text-slate-300 mt-1 flex items-center gap-2">
                <AlertCircle size={14} className="text-amber-500" />
                Case ID: #{String(violation.id).substring(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Fine Amount
                </p>
                <p className="text-2xl font-bold text-emerald-500">
                  ${violation.fine_amount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Incident Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">
                    Date & Time
                  </p>
                  <p className="text-sm font-medium text-slate-200">
                    {new Date(violation.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                  <Car size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">
                    Primary Evidence
                  </p>
                  <p className="text-sm font-medium text-slate-200">
                    License Plate OCR Match
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Case Description
            </h3>
            <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700">
              <p className="text-slate-300 leading-relaxed italic">
                "{violation.description}"
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
                Approve Citation
              </button>
              <button className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-bold transition-all">
                Request Manual Review
              </button>
              <button className="px-6 py-2.5 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl text-sm font-bold transition-all">
                Dismiss Case
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <User size={16} /> Owner Information
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-sm text-slate-400">Name</span>
              <span className="text-sm font-medium text-slate-200">
                Fetch from Vehicle DB...
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-sm text-slate-400">Compliance Points</span>
              <span className="text-sm font-bold text-blue-400">
                -10pts (Penalty Applied)
              </span>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Shield size={16} /> Enforcement Status
          </h3>
          <div className="flex items-center gap-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <AlertCircle size={24} className="text-amber-500" />
            <div>
              <p className="text-sm font-bold text-amber-500">Pending Review</p>
              <p className="text-xs text-slate-400">
                This violation requires officer confirmation before the citation
                is dispatched to the owner.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
