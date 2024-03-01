import {initServer} from './configs/app.js';
import { connect } from './configs/mongo.js';
import { createAdmin } from './src/user/user.controller.js';

//cargar express
initServer();
//cargar mongo
connect();
//crear administrador
createAdmin();