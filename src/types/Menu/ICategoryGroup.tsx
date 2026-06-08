import type { IMenu } from "./IMenu";

export interface ICategoryGroup {
  id_Ctmenu: number;
  title_Ctmenu: string;
  menus: IMenu[];
}