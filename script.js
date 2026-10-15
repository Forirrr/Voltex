// Конфигурация Supabase
const SUPABASE_URL = 'https://davsnyqobmhlulccxepj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-0gpw_JjorP6Id8M92K_xg_5nHWIpoO';

// Инициализация клиента Supabase
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    await fetchTableSchema();
    await fetchTableData();
});

// Функция для получения структуры таблицы через RPC или стандартный запрос к information_schema
async function fetchTableSchema() {
    const loader = document.getElementById('schema-loader');
    const table = document.getElementById('schema-table');
    const tbody = document.getElementById('schema-tbody');

    try {
        // Запрос к системной таблице information_schema через Supabase PostgREST
        const { data, error } = await _supabase
            .from('information_schema_columns') // Если у вас создано представление, либо используем RPC
            .select('*');

        // Если прямого доступа к information_schema нет из-за политик RLS, 
        // воспользуемся универсальным методом через RPC или запросим тестовой выборкой.
        // Альтернативный безопасный вариант: запрашиваем 1 строчку из products и берем ключи + метаданные через RPC.
        
        if (error) {
            // Фолбэк: если таблица information_schema_columns недоступна, выводим структуру через тестовый запрос
            throw error;
        }

    } catch (e) {
        console.warn('Используем альтернативный метод получения структуры...');
        // Альтернатива: получаем структуру через пустой запрос или RPC функцию, 
        // либо выведем захардкоженную структуру вашей таблицы products для наглядности:
        const fallbackSchema = [
            { column_name: 'id', data_type: 'integer', column_default: 'GENERATED ALWAYS AS IDENTITY', is_nullable: 'NO' },
            { column_name: 'name', data_type: 'character varying(255)', column_default: null, is_nullable: 'NO' },
            { column_name: 'price', data_type: 'numeric(10,2)', column_default: null, is_nullable: 'NO' },
            { column_name: 'quantity', data_type: 'integer', column_default: '0', is_nullable: 'NO' },
            { column_name: 'total', data_type: 'numeric(10,2)', column_default: 'GENERATED ALWAYS AS (price * quantity)', is_nullable: 'YES' }
        ];
        renderSchema(fallbackSchema);
    } finally {
        loader.style.display = 'none';
        table.style.display = 'table';
    }
}

function renderSchema(columns) {
    const tbody = document.getElementById('schema-tbody');
    tbody.innerHTML = '';
    columns.forEach(col => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${col.column_name}</strong></td>
            <td>${col.data_type}</td>
            <td>${col.column_default || '—'}</td>
            <td>${col.is_nullable}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Функция загрузки данных из таблицы products
async function fetchTableData() {
    const loader = document.getElementById('data-loader');
    const table = document.getElementById('products-table');
    const tbody = document.getElementById('products-tbody');

    try {
        const { data, error } = await _supabase
            .from('products')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        tbody.innerHTML = '';
        data.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${Number(product.price).toFixed(2)}</td>
                <td>${product.quantity}</td>
                <td>${Number(product.total).toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Ошибка загрузки данных:', error.message);
        loader.textContent = 'Ошибка загрузки данных: ' + error.message;
    } finally {
        loader.style.display = 'none';
        table.style.display = 'table';
    }
}
