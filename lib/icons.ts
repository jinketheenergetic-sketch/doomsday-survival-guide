import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBookOpen,
  faHouseCrack,
  faMeteor,
  faRobot,
  faSnowflake,
  faStar,
  faSun,
  faWater,
} from "@fortawesome/free-solid-svg-icons";

/**
 * 数据文件里用字符串记录 FontAwesome 图标名（如 "water"），
 * 这里把当前已用到的名字映射成图标对象；未知名回退到手册图标，避免渲染出错。
 */
const iconByName: Record<string, IconDefinition> = {
  water: faWater,
  "house-crack": faHouseCrack,
  meteor: faMeteor,
  snowflake: faSnowflake,
  robot: faRobot,
  sun: faSun,
  star: faStar,
};

export function getIconByName(name: string): IconDefinition {
  return iconByName[name] ?? faBookOpen;
}
