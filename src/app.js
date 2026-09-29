import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import pinoHttp from 'pino-http'
import env from './config/env.js'
import authRoutes from './routes/auth.routes.js'
import menusRoutes from './routes/menus.routes.js'
import permissionsRoutes from './routes/permissions.routes.js'
import rolesRoutes from './routes/roles.routes.js'
import usersRoutes from './routes/users.routes.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: env.clientUrl }))
app.use(express.json())
app.use(pinoHttp({ redact: ['req.headers.authorization'] }))

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/roles', rolesRoutes)
app.use('/api/permissions', permissionsRoutes)
app.use('/api/menus', menusRoutes)

app.get('/api/health', (_request, response) => {
  response.json({
    success: true,
    message: 'KREVORA backend is healthy',
    data: {
      service: 'krevora-rvsf-backend',
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
    },
  })
})

app.use((_request, response) => {
  response.status(404).json({
    success: false,
    message: 'Route not found',
    error: 'NOT_FOUND',
  })
})

app.use((error, _request, response, _next) => {
  response.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : 'Internal server error',
    error: error.code || 'INTERNAL_SERVER_ERROR',
  })
})

export default app
