import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { config } from 'dotenv'
import companyRoutes from './../src/company/company.routes.js'
import userRoutes from './../src/user/user.routes.js';
import categoryRoutes from './../src/category/category.routes.js';

//configuracion
const app = express();
config();
const port = process.env.PORT || 3057;

//configuracion del servidor
app.use(express.urlencoded({extended:'false'}));
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

//Declaracion de rutas
app.use('/user', userRoutes);
app.use('/category', categoryRoutes);
app.use('/company', companyRoutes);

export const initServer = ()=>{
    app.listen(port);
    console.log(`Server HTTP running in port ${port}`);
}

