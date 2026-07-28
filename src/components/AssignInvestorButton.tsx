import { CircleUser, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fakeInvestors } from "../data/investors";
import { investorStages, type InvestorStage } from "../data/investorStages";
import type { Signal } from "../types";
import { personPhotoUrl } from "../utils/avatars";
import { Highlight } from "./Highlight";
import { InlineSelect } from "./InlineSelect";

export function AssignInvestorButton({ signal }: { signal: Signal }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [assignedInvestor, setAssignedInvestor] = useState<string | null>(
    signal.assignedInvestor ?? null,
  );
  const [assignedStage, setAssignedStage] = useState<InvestorStage | null>(
    (signal.assignedStage as InvestorStage) ?? null,
  );
  const [draftInvestor, setDraftInvestor] = useState<string | null>(null);
  const [draftStage, setDraftStage] = useState<string>("Prospecting");

  useEffect(() => {
    if (!modalOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setModalOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  function openModal() {
    setDraftInvestor(assignedInvestor);
    setDraftStage(assignedStage ?? "Prospecting");
    setModalOpen(true);
  }

  function commit() {
    if (!draftInvestor) return;
    setAssignedInvestor(draftInvestor);
    setAssignedStage(draftStage as InvestorStage);
    setModalOpen(false);
  }

  return (
    <>
      {assignedInvestor ? (
        <button
          type="button"
          onClick={openModal}
          className="flex items-center gap-1.5"
        >
          <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500/25">
            <CircleUser className="h-3.5 w-3.5" />
            {assignedInvestor}
          </span>
          <span className="rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 dark:border-neutral-600 dark:text-neutral-300">
            {assignedStage}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={openModal}
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Assign investor
        </button>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-neutral-900">
            <div className="flex items-start justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-neutral-50">
                Assign investor to shortlist
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-neutral-800">
              <img
                src={personPhotoUrl(signal.id)}
                alt={signal.avatarInitials}
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
              <p className="text-sm leading-snug text-gray-700 dark:text-neutral-300">
                <Highlight text={signal.headline} />
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <InlineSelect
                value={draftInvestor}
                options={fakeInvestors}
                onChange={setDraftInvestor}
                placeholder="Select investor"
              />
              <InlineSelect
                value={draftStage}
                options={investorStages}
                onChange={setDraftStage}
                placeholder="Select stage"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-sm font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={commit}
                disabled={!draftInvestor}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
              >
                Assign investor
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
