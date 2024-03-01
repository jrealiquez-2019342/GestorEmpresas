'use strict'

import Company from './company.model.js';

export const test = (req, res) => {
    console.log('company test is running...');
    res.send({ message: `Company test is running` })
}

//Funcion para guardar las empresas
export const save = async (req, res) => {
    try {
        let data = req.body;
        //validar que la data no venga vacia
        if (Object.entries(data).length == 0) return res.status().send({ message: `Error saving company | Data is empty` })

        //ingresamos los años de trajectoria de forma manual
        //obtenemos la fecha de creacion de la empresa
        var foundedDate = new Date(data.foundedAt);
        //obtenemos la fecha actual
        var currentDate = new Date();

        //calculamos de forma breve los años
        var trajectory = currentDate.getFullYear() - foundedDate.getFullYear();

        //obtenemos el mes actual
        var currentMonth = currentDate.getMonth();
        //obtenemos el mes que se fundó la empresa
        var monthFounded = foundedDate.getMonth();

        //verificamos los meses y dias para poder saber los años de trayectoria con exactitud.
        if (currentMonth < monthFounded || (currentMonth === monthFounded && currentDate.getDate() < foundedDate.getDate())) {
            trajectory--;
        }

        //asignamos los años de trayectoria calculados a la data
        data.yearsTrajectory = trajectory;

        let company = new Company(data);
        await company.save();
        return res.send({ message: `Company saved successfully` });
    } catch (err) {
        if (err.keyValue.name) return res.status(400).send({ message: `Error Adding | Company with name '${err.keyValue.email}' already exist.` });
        if (err.keyValue.email) return res.status(400).send({ message: `Error Adding | Email '${err.keyValue.email}' is al ready token.` })
        console.error(err);
        return res.status(500).send({ message: `Error saving company` });
    }
}

//Funcion para ver todas las empresas
export const get = async (req, res) => {
    try {
        let companies = await Company.find().populate('Category', ['name']);
        return res.send({ companies });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error getting companies` });
    }
}

//Funcion para ver las empresas segun años de trayectoria
export const filterTrajectory = async (req, res) => {
    try {
        //extraer los años para filtrar
        let { years } = req.body;
        //validar que si tenga valor years
        if (!years) return res.status(400).send({ message: `Error getting companies | years is empty | filter years.` })

        // Obtener la fecha actual
        let currentDate = new Date();
        // Calcular la fecha límite
        const limitDate = new Date(currentDate.getFullYear() - years, currentDate.getMonth(), currentDate.getDate());

        let filter = await Company.find({ yearsOfTrajectory: years });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error getting companies | filter trajectory` });
    }
}

//Filtrar segun categoria de la A a la Z y viceversa

export const filterCategory = async (req, res) => {
    try {

        //obtenemos numero del params para saber que orden quiere
        //0-> A-Z || si no ingresa -> A-Z
        //1-> Z-A


        let { num } = req.params;

        //realizamos una consulta tipo Join para unir las categorias
        let companiesAZ = await Company.aggregate([
            {
                //obtenemos las categorias 
                $lookup: {
                    from: "categories", //nombre de la colección de categorías
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            {
                //coincidimos los ids para que no nos aparezcan todas las categorias
                $unwind: "$categoryDetails"
            },
            {
                //ordenamos las categorias de la A-Z
                $sort: { "categoryDetails.name": 1 }
            }
        ]);

        if (!num || num == 0) {
            return res.send({ companiesAZ });
        } else {
            let companiesZA = companiesAZ.slice().reverse();
            return res.send({ companiesZA });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error getting companies | filter category` })
    }
}

export const update = async () => {
    try {
        let data = req.body;
        let { id } = req.params;

        let companyUpdate = await Company.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        )

        if (!companyUpdate) return res.status(404).send({ message: `Company not found and not updated.` })
        return res.send({ message: `Company updated successfully.` }, companyUpdate);
    } catch (err) {
        if (err.keyValue.name) return res.status(400).send({ message: `Error Adding | Company with name '${err.keyValue.email}' already exist.` });
        if (err.keyValue.email) return res.status(400).send({ message: `Error Adding | Email '${err.keyValue.email}' is al ready token.` })
        console.error(err);
        return res.status(500).send({ message: `Error updating compnay | update` });
    }
}
