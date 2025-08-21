import { Sofa } from "lucide-react";
import roomsData from "@/app/fake-db/rooms.json";

export interface Room {
  name: string;
  budget: number;
  icon: any;
}

export const iconMap: Record<string, any> = { Sofa };

// Pobierz pokoje
export const getRooms = async (): Promise<Room[]> => {
  const stored = localStorage.getItem("rooms");
  const data = stored ? JSON.parse(stored) : roomsData;
  return data.map((room: any) => ({
    ...room,
    icon: iconMap[room.icon] || Sofa,
  }));
};

// Dodaj pokój
export const addRoom = async (room: { name: string; budget: number }) => {
  const stored = localStorage.getItem("rooms");
  const data = stored ? JSON.parse(stored) : roomsData;
  const newRoom = { ...room, icon: Sofa };
  data.push(newRoom);
  localStorage.setItem("rooms", JSON.stringify(data));
  return newRoom;
};
