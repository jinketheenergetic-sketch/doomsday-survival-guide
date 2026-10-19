import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBookOpen,
  faElevator,
  faFire,
  faHouseCrack,
  faKitMedical,
  faMeteor,
  faRobot,
  faSnowflake,
  faStairs,
  faStar,
  faSun,
  faTemperatureLow,
  faTowerBroadcast,
  faWater,
} from "@fortawesome/free-solid-svg-icons";

/**
 * 数据文件里用字符串记录 FontAwesome 图标名（如 "water"），
 * 这里把当前已用到的名字映射成图标对象；未知名回退到手册图标，避免渲染出错。
 */
const iconByName: Record<string, IconDefinition> = {
  water: faWater,
  "house-crack": faHouseCrack,
  elevator: faElevator,
  meteor: faMeteor,
  snowflake: faSnowflake,
  robot: faRobot,
  sun: faSun,
  star: faStar,
  fire: faFire,
  stairs: faStairs,
  "temperature-low": faTemperatureLow,
  "tower-broadcast": faTowerBroadcast,
  "kit-medical": faKitMedical,
};

export function getIconByName(name: string): IconDefinition {
  return iconByName[name] ?? faBookOpen;
}
