import Joi from 'joi'
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/permission.middleware.js'
import { validateBody } from '../middleware/validation.middleware.js'
import { createMenuController, getMenuController, listMenusController, updateMenuController, updateMenuStatusController } from '../controllers/menus.controller.js'

const router = Router()
const menuSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  key: Joi.string().trim().pattern(/^[A-Z][A-Z0-9_]*$/).max(120).required(),
  parent_id: Joi.number().integer().positive().allow(null),
  route: Joi.string().trim().max(255).allow(null, ''),
  icon: Joi.string().trim().max(100).allow(''),
  display_order: Joi.number().integer().min(0),
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
})
const updateSchema = menuSchema.fork(['name', 'key'], (field) => field.optional()).min(1)
const statusSchema = Joi.object({ status: Joi.string().valid('ACTIVE', 'INACTIVE').required() })

router.use(authenticate)
router.get('/', authorize('menus.view'), listMenusController)
router.get('/:id', authorize('menus.view'), getMenuController)
router.post('/', authorize('menus.create'), validateBody(menuSchema), createMenuController)
router.put('/:id', authorize('menus.update'), validateBody(updateSchema), updateMenuController)
router.patch('/:id/status', authorize('menus.update'), validateBody(statusSchema), updateMenuStatusController)

export default router
