import { createServerFn } from '@tanstack/react-start'
import { players, getTeam } from '@/mocks/data'
import { loggingMiddleware, authMiddleware } from './auth'

export const getPlayers = createServerFn({ method: 'GET' })
  .middleware([loggingMiddleware, authMiddleware])
  .handler(async ({ data }) => {
    // Aqui você faria a query no banco no futuro
    return players
  })

export const getTeamById = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ data: teamId }: { data: string }) => {
    return getTeam(teamId)
  })