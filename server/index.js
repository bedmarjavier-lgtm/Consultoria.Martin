const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5001;

// Configuración de almacenamiento para archivos subidos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta para recibir los leads
app.post('/api/leads', upload.single('bill'), (req, res) => {
    const { fullName, email, phone, cups, address } = req.body;
    const billFile = req.file ? req.file.path : null;

    // @Consuloria.Martin: Clasificación Geográfica Inteligente
    // Nominatim suele devolver: "Calle, Ciudad, Provincia, CP, España"
    // Intentamos extraer la zona (normalmente el penúltimo o antepenúltimo elemento)
    const addressParts = address ? address.split(',').map(p => p.trim()) : [];
    const zone = addressParts.length >= 3 ? addressParts[addressParts.length - 3] : 'Zona Desconocida';

    const newLead = {
        id: Date.now(),
        fullName,
        email,
        phone,
        cups,
        address,
        zone, // Campo de clasificación
        billFile,
        timestamp: new Date().toISOString()
    };

    const leadsFilePath = './leads.json';

    let leads = [];
    if (fs.existsSync(leadsFilePath)) {
        const rawData = fs.readFileSync(leadsFilePath);
        leads = JSON.parse(rawData);
    }

    leads.push(newLead);
    fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2));

    console.log('Lead recibido:', newLead);
    res.status(200).json({ message: 'Liderazgo guardado con éxito', leadId: newLead.id });
});

app.listen(PORT, () => {
    console.log(`Backend de Consultoria.Martin corriendo en http://localhost:${PORT}`);
});
