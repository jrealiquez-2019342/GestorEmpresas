import { Router } from 'express';
import { test, save, get, filterTrajectory, filterCategory, filterAlphabetical,update, generateReport} from './company.controller.js';
import { validateJwt, isAdmin } from './../middlewares/validate-jwt.js';

const api = Router();

/*================================*/
/* Rutas privadas - Administrador */
/*================================*/
//test
api.get('/test', [validateJwt, isAdmin], test);
//guardar compañia
api.post('/save', [validateJwt, isAdmin], save);

//obtener compañias
api.get('/get', [validateJwt, isAdmin], get);

//filtrar compañias según años de trayectoria
api.post('/filterTrajectory',[validateJwt, isAdmin], filterTrajectory)

//filtrar compañias según su categoria.
api.get('/filterCategory/:id', [validateJwt, isAdmin], filterCategory);

//filtrar segun orden ascendete o descendente.
api.get('/filterAlphabet/:num', [validateJwt, isAdmin], filterAlphabetical);

//modificar la compañia.
api.put('/update/:id', [validateJwt, isAdmin],update);

//generar reporte de excel
api.get('/report', [validateJwt, isAdmin], generateReport);

export default api;
