import Joi from 'joi'
import { Router } from 'express'
import { changePasswordController, loginController, meController } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validateBody } from '../middleware/validation.middleware.js'

const router = Router()

const loginSchema = Joi.object({
  identifier: Joi.string().trim().min(3).max(255).required(),
  password: Joi.string().min(8).max(128).required(),
})

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(8).max(128).required(),
  newPassword: Joi.string().min(8).max(128).required(),
})

router.post('/login', validateBody(loginSchema), loginController)
router.get('/me', authenticate, meController)
router.post('/change-password', authenticate, validateBody(changePasswordSchema), changePasswordController)

export default router
