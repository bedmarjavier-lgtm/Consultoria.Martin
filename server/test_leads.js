const fetch = require('node-fetch');
const FormData = require('form-data');

async function testLeads() {
    console.log('--- Iniciando Prueba de Leads ---');

    // 1. Crear un lead de prueba
    const testLead = {
        fullName: 'Test User Antigravity',
        email: 'test@antigravity.ai',
        phone: '999888777',
        cups: 'ES001122334455667788RR',
        address: 'Calle Ficticia 123, Sevilla, Andalucía, España'
    };

    console.log('Enviando lead de prueba...');

    const form = new FormData();
    form.append('fullName', testLead.fullName);
    form.append('email', testLead.email);
    form.append('phone', testLead.phone);
    form.append('cups', testLead.cups);
    form.append('address', testLead.address);

    try {
        const postResponse = await fetch('http://localhost:5001/api/leads', {
            method: 'POST',
            body: form
        });

        if (postResponse.ok) {
            const postResult = await postResponse.json();
            console.log('✅ Lead enviado con éxito:', postResult);
        } else {
            console.error('❌ Error al enviar lead:', postResponse.statusText);
            return;
        }

        // 2. Verificar que se ha guardado
        console.log('Verificando persistencia de leads...');
        const getResponse = await fetch('http://localhost:5001/api/leads_data');
        if (getResponse.ok) {
            const leads = await getResponse.json();
            const lastLead = leads[leads.length - 1];

            if (lastLead.fullName === testLead.fullName) {
                console.log('✅ Verificación de persistencia: OK');
                console.log('Datos del último lead:', lastLead);
            } else {
                console.error('❌ Error de persistencia: El último lead no coincide.');
            }
        } else {
            console.error('❌ Error al obtener leads:', getResponse.statusText);
        }

    } catch (error) {
        console.error('❌ Error de conexión con el servidor:', error.message);
        console.log('Asegúrate de que el servidor esté corriendo en http://localhost:5001');
    }
}

testLeads();
