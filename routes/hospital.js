// Requires
var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion')

// Inicializar variables
var app = express();

// importamos schema
var Hospital = require('../models/hospital')

// =======================================================
// Obtener todos los hospitales
// =======================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .populate('usuario', 'nombre email role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, hospitales) => {
                console.log(err);
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales!',
                        Errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {


                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });;

                });

            });
});

// =======================================================
// Crear un nuevo hospital
// =======================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                Errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            hospitalToken: req.hospital
        });

    });

});

// =======================================================
// Actualizar un hospital
// =======================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                Errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                Errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = body.usuario;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    Errors: err
                });
            }

            res.status(201).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });
});

// =======================================================
// Elimina un hospital
// =======================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                Errors: err
            });
        }

        if (!hospitalBorrado) {

            return res.status(200).json({
                ok: true,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                Errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        res.status(201).json({
            ok: true,
            usuario: hospitalBorrado
        });

    });

});


module.exports = app;