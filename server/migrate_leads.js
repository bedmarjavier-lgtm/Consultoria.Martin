require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function migrate() {
    console.log('--- Iniciando Migración de Leads locales a Supabase Cloud ---');
    const leadsFilePath = path.join(__dirname, 'leads.json');

    if (!fs.existsSync(leadsFilePath)) {
        console.log('No se encontró leads.json local.');
        return;
    }

    const leads = JSON.parse(fs.readFileSync(leadsFilePath));
    console.log(`Detectados ${leads.length} leads para migrar.`);

    for (const lead of leads) {
        // Limpiamos el ID local para que Supabase genere el suyo o lo usemos si es compatible
        const { id: _, ...leadData } = lead;

        console.log(`Migrando: ${leadData.fullName}...`);

        const { error } = await supabase
            .from('leads')
            .insert([leadData]);

        if (error) {
            console.error(`❌ Error migrando ${leadData.fullName}:`, error.message);
        } else {
            console.log(`✅ ${leadData.fullName} migrado.`);
        }
    }

    console.log('--- Migración Finalizada ---');
}

migrate();
