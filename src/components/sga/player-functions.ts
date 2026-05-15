import ApiService from "../../API/service";

/**
 * Busca a lista de jogadores e estatísticas da API Santos Games.
 * O ApiService já lida com a URL Base e o Token de Autenticação automaticamente.
 */
export const getPlayers = async (_options?: any) => {
  // Com base no padrão .NET do seu Swagger, o endpoint provavelmente é 'api/Players'
  // Se o endpoint for diferente (ex: apenas 'Players'), ajuste abaixo.
  const response = await ApiService.get("api/Players");
  
  return response;
};

/**
 * Busca a lista de campeonatos disponíveis no backend da Santos Games.
 */
export const getTournaments = async () => {
  const response = await ApiService.get("api/Tournaments");
  return response;
};

/**
 * Busca a lista de partidas (confrontos) da API.
 */
export const getMatches = async () => {
  const response = await ApiService.get("api/Matches");
  return response;
};

/**
 * Busca a lista de times da API.
 */
export const getTeams = async () => {
  const response = await ApiService.get("api/Teams");
  return response;
};

/**
 * Cria um novo campeonato no backend.
 */
export const createTournament = async (data: any) => {
  const response = await ApiService.post("api/Tournaments", data);
  return response;
};

/**
 * Cria um novo jogador no backend.
 */
export const createPlayer = async (data: any) => {
  const response = await ApiService.post("api/Players", data);
  return response;
};

/**
 * Cria um novo time no backend.
 */
export const createTeam = async (data: any) => {
  const response = await ApiService.post("api/Teams", data);
  return response;
};

/**
 * Busca as partidas de um campeonato específico para montar o chaveamento.
 */
export const getMatchesByTournament = async (tournamentId: string) => {
  const response = await ApiService.get(`api/Matches?tournamentId=${tournamentId}`);
  return response;
};

/**
 * Cria uma nova partida no backend.
 */
export const createMatch = async (data: any) => {
  const response = await ApiService.post("api/Matches", data);
  return response;
};

/**
 * Atualiza dados de uma partida existente (ex: atualizar placar ou trocar time no bracket).
 */
export const updateMatch = async (id: string, data: any) => {
  const response = await ApiService.put(`api/Matches/${id}`, data);
  return response;
};