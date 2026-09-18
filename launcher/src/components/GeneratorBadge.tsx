import { useEffect, useState } from "react";
import { Fingerprint, Info } from "lucide-react";
import { toast } from "sonner";
import { Modal, ModalHeader } from "./Modal";
import { api } from "../lib/api";
import { generatorLabel, type ModInspection } from "../lib/creative";
import { useCreative } from "../creative-store";

export function GeneratorBadge({
  inspection,
  title,
}: {
  inspection: ModInspection;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(inspection);
  const [note, setNote] = useState(inspection.override?.note ?? "");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setValue(inspection);
    setNote(inspection.override?.note ?? "");
  }, [inspection]);
  const current =
    value.sha256 === inspection.sha256
      ? { ...inspection, override: value.override }
      : inspection;
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        title="Why this generator label?"
        className="inline-flex shrink-0 items-center gap-1 rounded-md bg-violet-400/10 px-1.5 py-1 text-[10px] font-semibold text-violet-300"
        aria-label={`Generator evidence for ${title}`}
      >
        <Fingerprint className="size-3" />
        {generatorLabel(current)}
        <Info className="size-3" />
      </button>
      {open && (
        <Modal open onClose={() => setOpen(false)} size="lg">
          <ModalHeader
            title="The evidence behind the label"
            subtitle={title}
            onClose={() => setOpen(false)}
          />
          <div className="creative-modal-body">
            <span className="cr-eyebrow">
              GENERATOR INSPECTION
            </span>
            <h3>{generatorLabel(current)}</h3>
            <p>{inspection.scope}</p>
            {inspection.evidence.length ? (
              inspection.evidence.map((e, i) => (
                <div className="cr-evidence" key={i}>
                  <strong>{e.signal}</strong>
                  <code>{e.path}</code>
                  <p>{e.detail}</p>
                </div>
              ))
            ) : (
              <div className="cr-evidence">
                No supported generator signatures found. Custom packages and
                older templates can conceal these signals.
              </div>
            )}
            {inspection.limited && (
              <p className="cr-warning">
                Some large entries exceeded inspection limits. Detection may be
                incomplete.
              </p>
            )}
            <label>
              Correction note
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional: evidence you know about this file"
              />
            </label>
            <label>
              Your classification
              <select
                aria-label="Generator override"
                disabled={busy}
                value={current.override?.choice ?? "auto"}
                onChange={async (e) => {
                  setBusy(true);
                  try {
                    const override = await api.setGeneratorOverride(
                      inspection.sha256,
                      e.target.value,
                      note,
                    );
                    setValue({ ...inspection, override });
                    useCreative.setState((state) => ({
                      scans: Object.fromEntries(
                        Object.entries(state.scans).map(([id, scan]) => [
                          id,
                          {
                            ...scan,
                            files: scan.files.map((f) =>
                              f.inspection?.sha256 === inspection.sha256
                                ? {
                                    ...f,
                                    inspection: { ...f.inspection, override },
                                  }
                                : f,
                            ),
                          },
                        ]),
                      ),
                    }));
                  } catch (error) {
                    toast.error(String(error));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <option value="auto">Use detected evidence</option>
                <option value="mcreator">MCreator — marked by me</option>
                <option value="not_mcreator">Other tool — marked by me</option>
              </select>
            </label>
            <p className="cr-fine">
              Corrections apply to this exact file. Updating or editing the file
              triggers a fresh classification.
            </p>
            <code className="cr-hash">SHA-256 {inspection.sha256}</code>
            <p className="cr-fine">Detector {inspection.detector}</p>
          </div>
        </Modal>
      )}
    </>
  );
}
