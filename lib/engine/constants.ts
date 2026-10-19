/**
 * 引擎数值常量。
 * 抽牌、结算、评分与结局判定只从这里读取数值，避免魔法数字散落在各处。
 */

import type { Resources } from "@/lib/types";

/** 资源可以落到的最小 / 最大值，结算后统一钳制到这个区间。 */
export const RESOURCE_MIN = 0;
export const RESOURCE_MAX = 100;

/** 一局游戏的总天数（回合数）。 */
export const RUN_DAYS = 7;

/** 每局从 7 张中段池中抽取的事件数。 */
export const MIDDLE_EVENT_DRAW_COUNT = 5;

/** 开局时 5 项共用资源的初始值（专属资源由场景自身提供）。 */
export const INITIAL_RESOURCES: Readonly<Resources> = {
  hp: 100,
  sanity: 100,
  water: 60,
  food: 60,
  energy: 80,
};

/** 评分公式系数：avg(5 项资源) * SCORE_PER_RESOURCE_AVG。 */
export const SCORE_PER_RESOURCE_AVG = 10;
/** 每个 good 选项的加分。 */
export const SCORE_GOOD_CHOICE = 100;
/** 每个 bad 选项的扣分（取正值，计算时减去）。 */
export const SCORE_BAD_CHOICE = 50;
/** 每存活一天的加分。 */
export const SCORE_PER_DAY = 50;

/** 3 星的最低分。 */
export const THREE_STAR_MIN_SCORE = 1600;
/** 2 星的最低分；低于此值为 1 星。 */
export const TWO_STAR_MIN_SCORE = 1100;

/** best 结局要求的最低分。 */
export const BEST_ENDING_MIN_SCORE = 1600;
/** best 结局要求的专属资源最低值。 */
export const BEST_ENDING_MIN_SPECIFIC = 60;

/** 水或食物为 0 时，每次推进额外扣除的 HP。 */
export const DEPRIVATION_HP_PENALTY = 5;
