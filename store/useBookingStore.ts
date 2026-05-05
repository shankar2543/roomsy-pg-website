import { create } from "zustand";
import { BookingType } from "@/types/booking";

interface BookingState {
  pgId: string | null;
  roomId: string | null;
  bookingType: BookingType | null;
  persons: number;
  startDate: Date | null;
  idProofUrl: string | null;
  setPgId: (id: string) => void;
  setRoomId: (id: string) => void;
  setBookingType: (type: BookingType) => void;
  setPersons: (n: number) => void;
  setStartDate: (date: Date) => void;
  setIdProofUrl: (url: string) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  pgId: null,
  roomId: null,
  bookingType: null,
  persons: 1,
  startDate: null,
  idProofUrl: null,
  setPgId: (pgId) => set({ pgId }),
  setRoomId: (roomId) => set({ roomId }),
  setBookingType: (bookingType) => set({ bookingType }),
  setPersons: (persons) => set({ persons }),
  setStartDate: (startDate) => set({ startDate }),
  setIdProofUrl: (idProofUrl) => set({ idProofUrl }),
  reset: () =>
    set({
      pgId: null,
      roomId: null,
      bookingType: null,
      persons: 1,
      startDate: null,
      idProofUrl: null,
    }),
}));
