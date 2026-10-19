import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBookOpen,
  faBottleWater,
  faElevator,
  faFire,
  faHandshake,
  faHardDrive,
  faHouseCrack,
  faKitMedical,
  faMeteor,
  faPersonWalking,
  faRobot,
  faScrewdriverWrench,
  faServer,
  faSnowflake,
  faSolarPanel,
  faStairs,
  faStar,
  faSun,
  faTemperatureArrowDown,
  faTemperatureLow,
  faTowerBroadcast,
  faTriangleExclamation,
  faUserShield,
  faWater,
  faWind,
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
  "hard-drive": faHardDrive,
  "user-shield": faUserShield,
  "solar-panel": faSolarPanel,
  server: faServer,
  handshake: faHandshake,
  "screwdriver-wrench": faScrewdriverWrench,
  "person-walking": faPersonWalking,
  wind: faWind,
  "triangle-exclamation": faTriangleExclamation,
  "temperature-arrow-down": faTemperatureArrowDown,
  "bottle-water": faBottleWater,
};

export function getIconByName(name: string): IconDefinition {
  return iconByName[name] ?? faBookOpen;
}
