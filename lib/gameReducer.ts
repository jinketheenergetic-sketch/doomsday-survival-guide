/**
 * 本局状态 reducer。
 *
 * 把「新建 / 恢复 / 提交选择 / 推进 / 结束」五类动作收敛到一处，页面只负责
 * 收集输入与调用引擎，不再自行拼接 `RunState`。该模块是纯函数：
 * - 不读取 `localStorage`、时间或随机数；时间戳由 action 传入。
 * - 不修改传入的 state 与 run，未发生变化的动作原样返回旧 state。
 *
 * 选择结算由 US-008 的 `resolveChoice` 完成，reducer 只接收其返回值；
 * `day` / `eventIndex` 的推进统一走 `advance`，与引擎「结算不推进回合」的约定一致。
 */

import type { ChoiceResolution } from "@/lib/engine/resolve";
import type { ChoiceResult, RunState, RunStatus } from "@/lib/types";

/** 游戏页共享的本局状态。 */
export interface GameState {
  /** 当前对局；尚未新建或恢复时为 null。 */
  run: RunState | null;
  /** 最近一次提交选择产生的结算记录，供结果面板展示；新建 / 恢复后清空。 */
  lastResult: ChoiceResult | null;
}

export const initialGameState: GameState = {
  run: null,
  lastResult: null,
};

/**
 * 五类动作：
 * - `create`：用 `buildRun` 生成的新对局替换当前状态。
 * - `restore`：恢复存档中的对局；传 `null` 表示清空。
 * - `commitChoice`：接收 `resolveChoice` 的返回值，更新资源、计数与存活 / 死亡状态。
 * - `advance`：进入下一天；已是最后一个回合时标记为完成。
 * - `end`：主动结束本局（已死亡则保留死亡状态），只补记结束时间。
 *
 * `at` 为可选的 ISO 时间戳，结束时写入 `finishedAt`；不传则保持原值，
 * 以保证 reducer 不依赖系统时钟。
 */
export type GameAction =
  | { type: "create"; run: RunState }
  | { type: "restore"; run: RunState | null }
  | {
      type: "commitChoice";
      resolution: ChoiceResolution;
      /** 本次选择首次解锁的知识卡 id；重复解锁不必传入。 */
      newKnowledgeId?: string;
      at?: string;
    }
  | { type: "advance"; at?: string }
  | { type: "end"; at?: string };

function withFinishedAt(run: RunState, at?: string): RunState {
  return at === undefined ? run : { ...run, finishedAt: at };
}

function finishRun(run: RunState, status: RunStatus, at?: string): RunState {
  if (run.status === status && at === undefined) return run;
  return withFinishedAt({ ...run, status }, at);
}

/**
 * 推进一个回合。
 * 下标越界（最后一个事件已经选完）时标记为 `completed`，`day` 停在 `RUN_DAYS`；
 * 已结束的对局不再推进。
 */
function advanceRun(run: RunState, at?: string): RunState {
  if (run.status !== "playing") return run;

  const nextIndex = run.eventIndex + 1;
  if (nextIndex >= run.deck.length) {
    return finishRun(run, "completed", at);
  }

  return { ...run, eventIndex: nextIndex, day: run.day + 1 };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "create":
      return { run: action.run, lastResult: null };

    case "restore":
      return { run: action.run, lastResult: null };

    case "commitChoice": {
      if (!state.run || state.run.status !== "playing") return state;

      const resolved = action.resolution.state;
      const known = resolved.newKnowledgeIds ?? [];
      const withKnowledge =
        action.newKnowledgeId && !known.includes(action.newKnowledgeId)
          ? {
              ...resolved,
              newKnowledgeIds: [...known, action.newKnowledgeId],
            }
          : resolved;

      const run =
        resolved.status === "dead"
          ? finishRun(withKnowledge, "dead", action.at)
          : withKnowledge;

      return { run, lastResult: action.resolution.result };
    }

    case "advance": {
      if (!state.run) return state;

      const run = advanceRun(state.run, action.at);
      return run === state.run ? state : { ...state, run, lastResult: null };
    }

    case "end": {
      if (!state.run) return state;

      const status: RunStatus =
        state.run.status === "dead" ? "dead" : "completed";
      const run = finishRun(state.run, status, action.at);
      return run === state.run ? state : { ...state, run };
    }

    default:
      return state;
  }
}
