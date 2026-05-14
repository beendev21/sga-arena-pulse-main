import { createMiddleware } from '@tanstack/react-start'

export const loggingMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    console.log(`[API LOG]: ${request.method} ${request.url}`)
    const result = await next()
    return result
  },
)

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Retorna 401 se não houver token. Em rotas de página, você poderia redirecionar.
      return new Response('Não autorizado', { status: 401 })
    }

    // No futuro, valide o JWT aqui usando uma biblioteca como 'jose' ou 'jsonwebtoken'
    return await next()
  },
)