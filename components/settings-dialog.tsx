"use client";

import {
  faArrowRotateLeft,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useId, useRef, useState } from "react";

import {
  resetAllData,
  updateSettings,
  useSettings,
} from "@/lib/settings-store";
import { playSound } from "@/lib/sound";

interface SettingsDialogProps {
  onClose: () => void;
}

interface SettingSwitchProps {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}

function SettingSwitch({
  label,
  description,
  checked,
  onToggle,
}: SettingSwitchProps) {
  const labelId = useId();
  const descriptionId = useId();

  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p id={labelId} className="font-semibold text-ink">
          {label}
        </p>
        <p id={descriptionId} className="mt-0.5 text-sm leading-relaxed text-ink-soft">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        onClick={onToggle}
        className={`relative inline-flex h-11 w-16 shrink-0 items-center rounded-chip border-2 border-ink px-1 transition-colors duration-[var(--duration-fast)] ${
          checked ? "bg-teal" : "bg-paper"
        }`}
      >
        <span
          aria-hidden
          className={`h-7 w-7 rounded-chip border-2 border-ink bg-surface shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] ${
            checked ? "translate-x-7" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

/** 全局设置弹层：音效、减少动效与重置全部进度。 */
export function SettingsDialog({ onClose }: SettingsDialogProps) {
  const settings = useSettings();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // 打开后把焦点交给关闭按钮，键盘用户不会继续 tab 到背景。
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function toggleSound() {
    const next = !settings.soundEnabled;
    updateSettings({ soundEnabled: next });
    if (next) playSound("click");
  }

  function toggleReducedMotion() {
    updateSettings({ reducedMotion: !settings.reducedMotion });
    playSound("click");
  }

  function confirmReset() {
    resetAllData();
    setConfirmingReset(false);
    setResetDone(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        tabIndex={-1}
        aria-label="关闭设置"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/65 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="sheet-rise relative flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-card border-2 border-ink bg-surface shadow-card sm:rounded-card"
      >
        <header className="flex items-center justify-between gap-3 border-b-2 border-ink/10 p-5 sm:p-6">
          <h2 id={titleId} className="font-display text-2xl text-ink">
            设置
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="关闭设置"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-chip border-2 border-ink bg-paper text-ink shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)]"
          >
            <FontAwesomeIcon icon={faXmark} aria-hidden />
          </button>
        </header>

        <div className="overflow-y-auto p-5 sm:p-6">
          <div className="divide-y-2 divide-ink/10">
            <SettingSwitch
              label="音效"
              description="点击、正确或失误的选择、知识解锁与结算时播放合成短音。默认关闭。"
              checked={settings.soundEnabled}
              onToggle={toggleSound}
            />
            <SettingSwitch
              label="减少动效"
              description="关闭分数滚动、星级点亮与面板滑入等装饰性动画。"
              checked={settings.reducedMotion}
              onToggle={toggleReducedMotion}
            />
          </div>

          <section
            aria-labelledby={`${titleId}-reset`}
            className="mt-5 rounded-small border-2 border-danger/30 bg-danger/5 p-4"
          >
            <h3
              id={`${titleId}-reset`}
              className="font-display text-lg text-ink"
            >
              重置进度
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              清除全部本地存档：场景进度、结局、知识卡与进行中的对局。此操作无法撤销。
            </p>

            {confirmingReset ? (
              <div className="mt-3">
                <p className="text-sm font-bold text-danger">
                  确定要清除全部进度吗？
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={confirmReset}
                    className="inline-flex min-h-11 items-center justify-center rounded-button border-2 border-ink bg-danger px-4 font-semibold text-paper shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)]"
                  >
                    确认重置
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmingReset(false);
                      playSound("click");
                    }}
                    className="inline-flex min-h-11 items-center justify-center rounded-button border-2 border-ink bg-surface px-4 font-semibold text-ink shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)]"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setResetDone(false);
                  setConfirmingReset(true);
                  playSound("click");
                }}
                className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-button border-2 border-ink bg-surface px-4 font-semibold text-danger shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)]"
              >
                <FontAwesomeIcon icon={faArrowRotateLeft} aria-hidden />
                重置全部进度
              </button>
            )}

            {resetDone && (
              <p
                role="status"
                className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-success"
              >
                <FontAwesomeIcon
                  icon={faCheck}
                  aria-hidden
                  className="h-3.5 w-3.5"
                />
                已清除全部本地进度。
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
