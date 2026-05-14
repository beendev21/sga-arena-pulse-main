import { create } from 'zustand';
import { tournaments as initialTournaments, bracket as initialBracket, teams as initialTeams } from '@/mocks/data';

interface DataState {
  tournaments: typeof initialTournaments;
  teams: typeof initialTeams;
  bracket: typeof initialBracket;
  
  // Ações para alterar os dados
  updateBracket: (newBracket: any) => void;
  addTournament: (tournament: any) => void;
  removeTournament: (id: string) => void;
  updateMatchScore: (type: 'quarters' | 'semis' | 'final', index: number, scoreA: number, scoreB: number) => void;
}

export const useDataStore = create<DataState>((set) => ({
  tournaments: initialTournaments,
  teams: initialTeams,
  bracket: initialBracket,

  updateBracket: (newBracket) => set({ bracket: newBracket }),
  
  addTournament: (tournament) => set((state) => ({ 
    tournaments: [tournament, ...state.tournaments] 
  })),

  removeTournament: (id) => set((state) => ({ 
    tournaments: state.tournaments.filter(t => t.id !== id) 
  })),

  updateMatchScore: (type, index, scoreA, scoreB) => set((state) => {
    const newBracket = { ...state.bracket };
    if (type === 'final') {
      newBracket.final = { ...newBracket.final, scoreA, scoreB };
    } else {
      newBracket[type][index] = { ...newBracket[type][index], scoreA, scoreB };
    }
    return { bracket: newBracket };
  }),
}));