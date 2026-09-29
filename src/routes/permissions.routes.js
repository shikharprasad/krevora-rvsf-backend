import { Router } from 'express'
import { listPermissionsController } from '../controllers/permissions.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/permission.middleware.js'

const router = Router()
router.get('/', authenticate, authorize('roles.view'), listPermissionsController)

export default router
