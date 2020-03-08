// Requires
var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middlewares/autenticacion')

// Inicializar variables
var app = express();

// importamos schema
var Usuario = require('../models/usuario')

// =======================================================
// Obtener todos los usuarios
// =======================================================
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                console.log(err);
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios!',
                        Errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });

            });
});

// =======================================================
// Crear un nuevo usuario
// =======================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                Errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });

});

// =======================================================
// Actualizar un usuario
// =======================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                Errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                Errors: { message: 'No existe un usaurio con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.rol

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    Errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(201).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });
});

// =======================================================
// Elimina un usuario
// =======================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                Errors: err
            });
        }

        if (!usuarioBorrado) {

            return res.status(200).json({
                ok: true,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                Errors: { message: 'No existe un usaurio con ese ID' }
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});


module.exports = app;