import { createFileRoute } from '@tanstack/react-router'
import ApiService from '@/API/service'

export const Route = createFileRoute('/api/Players')({
  server: {
    handlers: {
      GET: async () => {
        const data = await ApiService.get('api/Players')
        return Response.json(data)
      },
    },
  },
})