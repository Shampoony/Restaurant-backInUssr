import { Router } from 'express'
import { currentSession, login, logout, readToken, requireAdmin } from '../auth.js'
import { Validator } from '../validation.js'

export const authRouter = Router()

authRouter.post('/login', (req, res) => {
  const v = new Validator()
  const loginValue = v.string('login', req.body?.login, { max: 60, label: 'Логин' })
  const password = v.string('password', req.body?.password, { max: 120, label: 'Пароль' })
  v.done()

  res.json(login(loginValue, password))
})

authRouter.post('/logout', (req, res) => {
  logout(readToken(req))
  res.status(204).end()
})

authRouter.get('/me', requireAdmin, (req, res) => {
  res.json(currentSession(req))
})
