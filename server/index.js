require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5001;

// Inicialización de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración de almacenamiento para archivos locales (Backup/Temporal)
const localUploadsDir = './uploads';
if (!fs.existsSync(localUploadsDir)) {
    fs.mkdirSync(localUploadsDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, localUploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos locales
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta para recibir los leads (Unified Cloud Sync)
app.post('/api/leads', upload.single('bill'), async (req, res) => {
    const { fullName, email, phone, cups, address, userId } = req.body;
    const localFilePath = req.file ? req.file.path.replace(/\\/g, '/') : null;
    let publicUrl = null;

    // 1. Clasificación Geográfica Inteligente
    const addressParts = address ? address.split(',').map(p => p.trim()) : [];
    const zone = addressParts.length >= 3 ? addressParts[addressParts.length - 3] : 'Zona Desconocida';

    // 2. Sincronización con Supabase (Archivo)
    if (req.file) {
        try {
            const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
            const fileBuffer = fs.readFileSync(req.file.path);

            const { error: uploadError } = await supabase.storage
                .from('bills')
                .upload(`leads/${fileName}`, fileBuffer, {
                    contentType: req.file.mimetype,
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl: fileUrl } } = supabase.storage
                .from('bills')
                .getPublicUrl(`leads/${fileName}`);

            publicUrl = fileUrl;
        } catch (error) {
            console.error('⚠️ Supabase Storage Error:', error.message);
        }
    }

    const newLead = {
        fullName,
        email,
        phone,
        cups,
        address,
        zone,
        userId: userId || null,
        billFile: publicUrl || localFilePath, // Prioridad a la nube
        timestamp: new Date().toISOString()
    };

    // 3. Persistencia en Supabase Database
    try {
        console.log('--- Intentando Sincronización Cloud ---');
        const { error } = await supabase
            .from('leads')
            .insert([newLead]);

        if (error) {
            console.error('⚠️ Supabase DB Error Detail:', error);
            throw error;
        }
        console.log('✅ Lead sincronizado en Supabase Cloud');
    } catch (error) {
        console.error('⚠️ Supabase DB Error:', error.message);
        console.log('--- Fallback a persistencia local activo ---');
    }

    // 4. Fallback Local (leads.json)
    const leadsFilePath = path.join(__dirname, 'leads.json');
    let leads = [];
    try {
        if (fs.existsSync(leadsFilePath)) {
            const rawData = fs.readFileSync(leadsFilePath);
            leads = JSON.parse(rawData);
        }
        leads.push({ ...newLead, id: Date.now() });
        fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2));
        console.log('💾 Lead guardado localmente en leads.json');
    } catch (e) {
        console.error('Err local save:', e);
    }

    res.status(200).json({
        message: 'Lead procesado con éxito',
        sync: !!publicUrl,
        lead: newLead
    });
});

// Ruta para obtener los leads (Admin Dashboard - Cloud Preference)
app.get('/api/leads_data', async (req, res) => {
    let cloudLeads = [];
    let localLeads = [];

    // 1. Intentar obtener de Supabase
    try {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('timestamp', { ascending: false });

        if (!error && data) {
            cloudLeads = data;
        }
    } catch (error) {
        console.error('⚠️ Supabase fetch error:', error.message);
    }

    // 2. Obtener de Local
    try {
        const leadsFilePath = path.join(__dirname, 'leads.json');
        if (fs.existsSync(leadsFilePath)) {
            const rawData = fs.readFileSync(leadsFilePath);
            localLeads = JSON.parse(rawData);
        }
    } catch (error) {
        console.error('⚠️ Local fetch error:', error.message);
    }

    // 3. Unificar y limpiar duplicados (por timestamp o ID si existiera)
    // Para simplificar y asegurar que ves TODO lo que entra:
    const combinedLeads = [...cloudLeads];

    // Añadimos los locales que no estén ya en la nube (evitar duplicados visuales simples)
    localLeads.forEach(local => {
        const exists = combinedLeads.some(cloud => cloud.email === local.email && cloud.timestamp === local.timestamp);
        if (!exists) combinedLeads.push(local);
    });

    // Ordenar por fecha descendente
    combinedLeads.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json(combinedLeads);
});

app.listen(PORT, () => {
    console.log(`Backend de Consultoria.Martin (Cloud Hub) corriendo en http://localhost:${PORT}`);
});
