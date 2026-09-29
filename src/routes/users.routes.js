import Joi from 'joi'
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/permission.middleware.js'
import { validateBody } from '../middleware/validation.middleware.js'
import { createUserController, getUserController, listUsersController, replaceUserRolesController, resetUserPasswordController, updateUserController, updateUserStatusController } from '../controllers/users.controller.js'

const router = Router()
const userFields = {
  full_name: Joi.string().trim().min(2).max(150),
  username: Joi.string().trim().lowercase().min(3).max(80),
  email: Joi.string().trim().lowercase().email().max(255),
  mobile: Joi.string().trim().max(30).allow(''),
  password: Joi.string().min(8).max(128),
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
  roleIds: Joi.array().items(Joi.number().integer().positive()).unique(),
}
const createSchema = Joi.object({ ...userFields, full_name: userFields.full_name.required(), username: userFields.username.required(), email: userFields.email.required(), password: userFields.password.required() })
const updateSchema = Joi.object(userFields).min(1)
const statusSchema = Joi.object({ status: Joi.string().valid('ACTIVE', 'INACTIVE').required() })
const rolesSchema = Joi.object({ roleIds: userFields.roleIds.required() })
const resetPasswordSchema = Joi.object({ password: userFields.password.required() })

router.use(authenticate)
router.get('/', authorize('users.view'), listUsersController)
router.get('/:id', authorize('users.view'), getUserController)
router.post('/', authorize('users.create'), validateBody(createSchema), createUserController)
router.put('/:id', authorize('users.update'), validateBody(updateSchema), updateUserController)
router.patch('/:id/status', authorize('users.update'), validateBody(statusSchema), updateUserStatusController)
router.put('/:id/roles', authorize('users.update'), validateBody(rolesSchema), replaceUserRolesController)
router.post('/:id/reset-password', authorize('users.update'), validateBody(resetPasswordSchema), resetUserPasswordController)

export default router
