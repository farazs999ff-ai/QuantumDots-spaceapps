import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Users, X } from 'lucide-react';
import { PRESENTATION_SLIDES, PRESENTERS } from '../presentation/deckData';
import { downloadPresentationPptx } from '../presentation/exportPptx';

interface PresentationModalProps {
  open: boolean;
  onClose: () => void;
}

export function PresentationModal({ open, onClose }: PresentationModalProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [presenterNames, setPresenterNames] = useState<string[]>(() =>
    PRESENTERS.map((p) => p.defaultName),
  );
  const [showTeamEditor, setShowTeamEditor] = useState(false);
  const [exporting, setExporting] = useState(false);

  const slide = PRESENTATION_SLIDES[slideIndex];
  const activePresenter = PRESENTERS[slide.presenterIndex];
  const activePresenterName =
    presenterNames[slide.presenterIndex]?.trim() || activePresenter.defaultName;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setSlideIndex((prev) => Math.min(PRESENTATION_SLIDES.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setSlideIndex((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleDownload = async () => {
    setExporting(true);
    try {
      await downloadPresentationPptx(presenterNames);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="9-Slide Presentation Deck for 6 Presenters"
    >
      <div className="w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#0a0e17] border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Top Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-800 bg-[#070a11]">
          <div className="flex items-baseline gap-3">
            <h2 className="text-sm font-semibold text-slate-100 whitespace-nowrap">
              Project Explanation Deck
            </h2>
            <span className="text-xs font-mono text-slate-400 tabular-nums whitespace-nowrap">
              9 Slides · 6 Presenters
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTeamEditor((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                showTeamEditor
                  ? 'bg-slate-800 text-slate-100 border-slate-700'
                  : 'text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800/70'
              }`}
            >
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Edit 6 Presenters</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{exporting ? 'Generating...' : 'Download .pptx'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close presentation"
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Optional 6-Presenter Name Editor */}
        {showTeamEditor && (
          <div className="px-5 py-3 border-b border-slate-800 bg-[#080c15] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {PRESENTERS.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 bg-[#0b111e] border border-slate-800 rounded-md px-2.5 py-1.5"
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-sky-400">
                    Slides {p.slideNumbers.join(', ')}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{p.role}</div>
                </div>
                <input
                  type="text"
                  value={presenterNames[idx]}
                  onChange={(e) => {
                    const next = [...presenterNames];
                    next[idx] = e.target.value;
                    setPresenterNames(next);
                  }}
                  aria-label={`Presenter ${p.id} name`}
                  className="w-36 px-2 py-1 text-xs bg-[#070a11] border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            ))}
          </div>
        )}

        {/* Slide Stage + Speaker Notes */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* 16:9 Slide Canvas */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-[#070a11] border border-slate-800 rounded-lg p-6 min-h-[380px]">
            <div>
              <div className="flex items-center justify-between text-[11px] pb-2.5 border-b border-slate-800/90">
                <span className="font-mono font-semibold text-sky-400 uppercase">
                  {slide.kicker}
                </span>
                <span className="text-slate-300">
                  {activePresenterName} · {activePresenter.role}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-100 mt-4 tracking-tight">
                {slide.title}
              </h3>
              <p className="text-sm text-slate-400 mt-1">{slide.subtitle}</p>

              {/* Layout-specific Slide Body */}
              <div className="mt-5 space-y-4">
                {slide.stats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {slide.stats.map((s) => (
                      <div
                        key={s.label}
                        className="bg-slate-900/90 border border-slate-800 rounded-md p-3"
                      >
                        <div className="text-[11px] text-slate-400">{s.label}</div>
                        <div className="text-base font-mono font-semibold tabular-nums text-sky-400 mt-1">
                          {s.value}
                          {s.unit ? (
                            <span className="text-xs text-slate-400 ml-1">{s.unit}</span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {slide.flowSteps && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {slide.flowSteps.map((step) => (
                      <div
                        key={step.step}
                        className="bg-slate-900/90 border border-slate-800 rounded-md p-3 space-y-1.5"
                      >
                        <div className="text-[10px] font-mono font-semibold text-sky-400">
                          STAGE {step.step}
                        </div>
                        <div className="text-xs font-semibold text-slate-100">{step.title}</div>
                        <p className="text-xs text-slate-400 leading-relaxed">{step.detail}</p>
                      </div>
                    ))}
                  </div>
                )}

                {slide.equation && (
                  <div className="space-y-3">
                    <div className="bg-[#0b1324] border border-sky-500/40 rounded-md p-3.5 text-center">
                      <div className="font-mono text-xs sm:text-sm font-semibold text-slate-100 break-words">
                        {slide.equation.formula}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1.5">
                        {slide.equation.caption}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {slide.equation.terms.map((t) => (
                        <div
                          key={t.symbol}
                          className="bg-slate-900/90 border border-slate-800 rounded-md p-2.5 flex items-center gap-3"
                        >
                          <span className="font-mono text-xs font-semibold text-sky-400 shrink-0">
                            {t.symbol}
                          </span>
                          <span className="text-xs text-slate-300">{t.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {slide.table && (
                  <div className="overflow-x-auto border border-slate-800 rounded-md">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#0d1526] border-b border-slate-800">
                          {slide.table.headers.map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2 font-mono font-semibold text-sky-400 whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {slide.table.rows.map((row) => (
                          <tr key={row[0]} className="bg-slate-900/60">
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                className={`px-3 py-2 ${
                                  ci === 0
                                    ? 'font-medium text-slate-100'
                                    : 'font-mono tabular-nums text-slate-300'
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {slide.columns && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {slide.columns.map((col, idx) => (
                      <div
                        key={col.heading}
                        className="bg-slate-900/90 border border-slate-800 rounded-md p-3.5"
                      >
                        <div
                          className={`text-xs font-semibold mb-2 ${
                            idx === 0 ? 'text-sky-400' : 'text-emerald-400'
                          }`}
                        >
                          {col.heading}
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-4 leading-relaxed">
                          {col.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {slide.bullets && (
                  <div className="bg-slate-900/70 border border-slate-800 rounded-md p-3.5">
                    <ul className="space-y-1.5 text-xs text-slate-200 list-disc pl-4 leading-relaxed">
                      {slide.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {slide.layout === 'title' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                    {PRESENTERS.map((p, idx) => (
                      <div
                        key={p.id}
                        className="bg-[#0b1324] border border-slate-800 rounded-md p-2.5"
                      >
                        <div className="text-xs font-semibold text-slate-100 truncate">
                          {presenterNames[idx]?.trim() || p.defaultName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                          {p.role}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-400 mt-1.5">
                          Slides {p.slideNumbers.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-4 mt-5 border-t border-slate-800/80">
              <span>Quantum Dots in Projection · Technical Overview</span>
              <span className="font-mono tabular-nums">
                {slide.number} / {PRESENTATION_SLIDES.length}
              </span>
            </div>
          </div>

          {/* Speaker Notes & 6-Person Handover Cue */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="bg-[#070a11] border border-slate-800 rounded-lg p-4 flex-1">
              <div className="text-[11px] font-mono uppercase text-slate-400">
                Speaker Assignment
              </div>
              <div className="text-sm font-semibold text-slate-100 mt-1">
                {activePresenterName}
              </div>
              <div className="text-xs text-sky-400">{activePresenter.role}</div>

              <div className="text-[11px] font-mono uppercase text-slate-400 mt-4 mb-1.5">
                Narration Script
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{slide.speakerNotes}</p>
            </div>

            <div className="bg-[#070a11] border border-slate-800 rounded-lg p-3.5">
              <div className="text-[11px] font-mono uppercase text-slate-400 mb-2">
                6-Presenter Handover Map
              </div>
              <div className="space-y-1.5">
                {PRESENTERS.map((p, idx) => {
                  const isCurrent = idx === slide.presenterIndex;
                  const name = presenterNames[idx]?.trim() || p.defaultName;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSlideIndex(p.slideNumbers[0] - 1)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left text-xs transition-colors ${
                        isCurrent
                          ? 'bg-slate-800 text-slate-100 border border-slate-700'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                      }`}
                    >
                      <span className="truncate font-medium">{name}</span>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-2">
                        S{p.slideNumbers.join(', S')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Slide Strip & Navigation */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-800 bg-[#070a11]">
          <button
            type="button"
            onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
            disabled={slideIndex === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {PRESENTATION_SLIDES.map((s, idx) => {
              const active = idx === slideIndex;
              return (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => setSlideIndex(idx)}
                  className={`px-2.5 py-1 text-xs font-mono tabular-nums rounded transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-100 border border-slate-800'
                  }`}
                >
                  {s.number}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() =>
              setSlideIndex((i) => Math.min(PRESENTATION_SLIDES.length - 1, i + 1))
            }
            disabled={slideIndex === PRESENTATION_SLIDES.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
