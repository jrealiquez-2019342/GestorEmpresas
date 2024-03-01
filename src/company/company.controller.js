'use strict'

import Company from './company.model.js';
import ExcelJS from 'exceljs';


export const test = (req, res) => {
    console.log('company test is running...');
    res.send({ message: `Company test is running` })
}

//Funcion para guardar las empresas
export const save = async (req, res) => {
    try {
        let data = req.body;
        console.log(data);
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
        /*if (err.keyValue.name) return res.status(400).send({ message: `Error Adding | Company with name '${err.keyValue.email}' already exist.` });
        if (err.keyValue.email) return res.status(400).send({ message: `Error Adding | Email '${err.keyValue.email}' is al ready token.` })*/
        console.error(err);
        return res.status(500).send({ message: `Error saving company` });
    }
}

//Funcion para ver todas las empresas
export const get = async (req, res) => {
    try {
        let companies = await Company.find().populate('category', ['name']);
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

        let filter = await Company.find({ yearsTrajectory: years }).populate('category', ['name']);
        return res.send({filter})
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error getting companies | filter trajectory` });
    }
}

//Funcion para filtrar a las empresas por orden alfabetico
export const filterAlphabetical = async(req, res)=>{
    try {
        //obtenemos numero del params para saber que orden quiere
        //1-> A-Z -> A-Z (1)
        //0-> Z-A (-1)
        let { num } = req.params;
        let order = 1;

        if(!num || num == 1){
            order = 1;
        }else{
            order = -1;
        }

        let filter = await Company.find().sort({name: order});
        return res.send({filter});

    } catch (err) {
        console.error(err);
        return res.status(500).send({message:`Error getting companies | filterName`})
    }
}

//Filtrar segun categoria de la A a la Z y viceversa

export const filterCategory = async (req, res) => {
    try {

        let {id} = req.params;

        let filter = await Company.find({category: id}).populate('category', ['name']);
        return res.send(filter);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error getting companies | filter category` })
    }
}

//funcion para modificar las empresas.
export const update = async (req, res) => {
    try {
        let data = req.body;
        let { id } = req.params;

        let companyUpdate = await Company.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        )

        if (!companyUpdate) return res.status(404).send({ message: `Company not found and not updated.` })
        return res.send({ message: `Company updated successfully.`, companyUpdate });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error updating compnay | update` });
    }
}


//función para generar el reporte en Excel
export const generateReport = async (req, res) => {
    try {
        //obtenemos las empresas de nuestra base de datos
        let companies = await Company.find().sort({name: 1}).populate('category', 'name');

        //creamos el libro de excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Companies Interfer - 2024');

        //definimos las columnas
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Address', key: 'address', width: 50 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Impact Level', key: 'impactLevel', width: 15 },
            { header: 'Founded At', key: 'foundedAt', width: 15 },
            { header: 'Years Trajectory', key: 'yearsTrajectory', width: 15 },
            { header: 'Category', key: 'category', width: 20 },
        ];

        //agregamos las empresas
        companies.forEach(company => {
            worksheet.addRow({
                name: company.name,
                address: company.address,
                phone: parseInt(company.phone),
                email: company.email,
                impactLevel: company.impactLevel,
                foundedAt: company.foundedAt.toISOString().split('T')[0],
                yearsTrajectory: company.yearsTrajectory,
                category: company.category.name,
            });
        });

        // Centrar el contenido de la columna de categoría
        worksheet.getColumn('category').alignment = { horizontal: 'center' };
        worksheet.getColumn('yearsTrajectory').alignment = { horizontal: 'center' };
        worksheet.getColumn('foundedAt').alignment = { horizontal: 'center' };
        worksheet.getColumn('impactLevel').alignment = { horizontal: 'center' };

        //escribir el archivo de excel en memoria
        const buffer = await workbook.xlsx.writeBuffer();

        //enviamos el archivo de excel como respusta al usuario
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Interfer Companies - 2024.xlsx');
        res.send(buffer);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: `Error generating Excel report` });
    }
};