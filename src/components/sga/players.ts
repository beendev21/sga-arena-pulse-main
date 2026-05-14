import { createFileRoute } from '@tanstack/react-router'
import { players } from '@/mocks/data'

export const Route = createFileRoute('/api/players')({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(players)
      },
    },
  },
})