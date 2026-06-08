export interface IMenu {
  id: number;
  title: string;
  createdDate: string;
  status: number;
  thumnail: string;
  order: number;
  id_menu: number; // Thường là ID của Category cha
  url: string;
}

