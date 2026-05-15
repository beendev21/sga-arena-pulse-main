import ApiService from "../../API/service";

/**
 * Busca a lista de jogadores e estatísticas da API Santos Games.
 * O ApiService já lida com a URL Base e o Token de Autenticação automaticamente.
 * @method GET
 * @url api/Players
 */
export const getPlayers = async (_options?: any) => {
  // Com base no padrão .NET do seu Swagger, o endpoint provavelmente é 'api/Players'
  // Se o endpoint for diferente (ex: apenas 'Players'), ajuste abaixo.
  const response = await ApiService.get("api/Players");
  
  return response;
};

/**
 * Busca a lista de campeonatos disponíveis no backend da Santos Games.
 * @method GET
 * @url api/Tournaments
 */
export const getTournaments = async () => {
  const response = await ApiService.get("api/Tournaments");
  return response;
};

/**
 * Busca a lista de partidas (confrontos) da API.
 * @method GET
 * @url api/Matches
 */
export const getMatches = async () => {
  const response = await ApiService.get("api/Matches");
  return response;
};

/**
 * Busca a lista de times da API.
 * @method GET
 * @url api/Teams
 */
export const getTeams = async () => {
  const response = await ApiService.get("api/Teams");
  return response;
};

/**
 * Cria um novo campeonato no backend.
 * @method POST
 * @url api/Tournaments
 */
export const createTournament = async (data: any) => {
  const response = await ApiService.post("api/Tournaments", data);
  return response;
};

/**
 * Cria um novo jogador no backend.
 * @method POST
 * @url api/Players
 */
export const createPlayer = async (data: any) => {
  const response = await ApiService.post("api/Players", data);
  return response;
};

/**
 * Cria um novo time no backend.
 * @method POST
 * @url api/Teams
 */
export const createTeam = async (data: any) => {
  const response = await ApiService.post("api/Teams", data);
  return response;
};

/**
 * Busca as partidas de um campeonato específico para montar o chaveamento.
 * @method GET
 * @url api/Matches?tournamentId={id}
 */
export const getMatchesByTournament = async (tournamentId: string) => {
  const response = await ApiService.get(`api/Matches?tournamentId=${tournamentId}`);
  return response;
};

/**
 * Cria uma nova partida no backend.
 * @method POST
 * @url api/Matches
 */
export const createMatch = async (data: any) => {
  const response = await ApiService.post("api/Matches", data);
  return response;
};

/**
 * Atualiza dados de uma partida existente (ex: atualizar placar ou trocar time no bracket).
 * @method PUT
 * @url api/Matches/{id}
 */
export const updateMatch = async (id: string, data: any) => {
  const response = await ApiService.put(`api/Matches/${id}`, data);
  return response;
};