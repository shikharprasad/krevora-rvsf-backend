import Joi from 'joi'
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/permission.middleware.js'
import { validateBody } from '../middleware/validation.middleware.js'
import { createRoleController, getRoleController, getRoleMenusController, getRolePermissionsController, listRolesController, updateRoleController, updateRoleMenusController, updateRolePermissionsController, updateRoleStatusController } from '../controllers/roles.controller.js'

const router = Router()
const roleSchema = Joi.object({ name: Joi.string().trim().min(2).max(100).required(), key: Joi.string().trim().pattern(/^[A-Z][A-Z0-9_]*$/).max(100).required(), description: Joi.string().allow(''), status: Joi.string().valid('ACTIVE', 'INACTIVE') })
const updateSchema = roleSchema.fork(['name', 'key'], (field) => field.optional()).min(1)
const statusSchema = Joi.object({ status: Joi.string().valid('ACTIVE', 'INACTIVE').required() })
const assignmentsSchema = (field) => Joi.object({ [field]: Joi.array().items(Joi.number().integer().positive()).unique().required() })

router.use(authenticate)
router.get('/', authorize('roles.view'), listRolesController)
router.get('/:id', authorize('roles.view'), getRoleController)
router.post('/', authorize('roles.create'), validateBody(roleSchema), createRoleController)
router.put('/:id', authorize('roles.update'), validateBody(updateSchema), updateRoleController)
router.patch('/:id/status', authorize('roles.update'), validateBody(statusSchema), updateRoleStatusController)
router.get('/:id/permissions', authorize('roles.view'), getRolePermissionsController)
router.put('/:id/permissions', authorize('roles.update'), validateBody(assignmentsSchema('permissionIds')), updateRolePermissionsController)
router.get('/:id/menus', authorize('roles.view'), getRoleMenusController)
router.put('/:id/menus', authorize('roles.update'), validateBody(assignmentsSchema('menuIds')), updateRoleMenusController)

export default router
