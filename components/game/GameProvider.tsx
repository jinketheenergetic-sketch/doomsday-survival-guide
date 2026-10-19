"use client";

/**
 * 本局状态 Provider。
 *
 * 页面通过 `useGame()` 拿到 `state` 与 `dispatch`，本局数据统一由
 * `lib/gameReducer.ts` 管理。Provider 是唯一接触 `StorageAdapter` 的本局组件：
 * 挂载后从 `activeRun` 恢复，之后 run 每次变化都写回，页面不直接访问 localStorage。
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";

import {
  gameReducer,
  initialGameState,
  type GameAction,
  type GameState,
} from "@/lib/gameReducer";
import { storageAdapter, type StorageAdapter } from "@/lib/storage";
import type { RunState } from "@/lib/types";

export interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export interface GameProviderProps {
  children: ReactNode;
  /** 默认使用全局适配器；测试可注入自己的 `StorageAdapter`。 */
  adapter?: StorageAdapter;
  /**
   * 首次挂载时决定启用哪一局：入参是 `activeRun` 中的存档（没有则为 `null`），
   * 返回值将作为本局状态。默认原样采用存档。返回新对象时视为新开局并写回存储。
   */
  resolveRun?: (stored: RunState | null) => RunState | null;
}

function resolveStoredRun(
  stored: RunState | null,
  resolveRun?: (stored: RunState | null) => RunState | null,
): RunState | null {
  return resolveRun ? resolveRun(stored) : stored;
}

export function GameProvider({
  children,
  adapter = storageAdapter,
  resolveRun,
}: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  /**
   * 已与存储对齐的 run。`undefined` 表示尚未执行首次恢复，
   * 此时不能把空状态写回存储，否则会清掉刚打开页面时还在的存档。
   */
  const persistedRun = useRef<RunState | null | undefined>(undefined);

  useEffect(() => {
    if (persistedRun.current === undefined) {
      const stored = adapter.getActiveRun();
      const initial = resolveStoredRun(stored, resolveRun);

      // 沿用存档时保持同一引用，避免挂载后立刻重写；新开局强制写回。
      persistedRun.current = initial === stored ? stored : null;

      if (initial) {
        dispatch(
          initial === stored
            ? { type: "restore", run: initial }
            : { type: "create", run: initial },
        );
      }
      return;
    }

    if (state.run === persistedRun.current) return;

    persistedRun.current = state.run;
    if (state.run) {
      adapter.saveActiveRun(state.run);
    } else {
      adapter.clearActiveRun();
    }
  }, [adapter, resolveRun, state.run]);

  const value = useMemo<GameContextValue>(() => ({ state, dispatch }), [state]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

/** 读取本局状态与 dispatch；必须在 `GameProvider` 内调用。 */
export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame 必须在 GameProvider 内使用");
  }
  return context;
}
