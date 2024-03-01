import {Router} from 'express'

import { test, register, login, update, deleteU} from './user.controller.js';
import { validateJwt, isAdmin} from './../middlewares/validate-jwt.js';

const api = Router();

/*=================*/
/* Rutas publicas  */
/*=================*/
api.get('/test', [validateJwt, isAdmin], test);
api.post('/register', register);
api.post('/login', login);

/*=================*/
/* Rutas privadas  */
/*=================*/
//actualizar cuenta
api.put('/update', [validateJwt, isAdmin], update);
//eliminar cuenta
api.delete('/delete', [validateJwt, isAdmin], deleteU);

export default api;