const SUPABASE_URL = 'https://davsnyqobmhlulccxepj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-0gpw_JjorP6Id8M92K_xg_5nHWIpoO';

document.addEventListener('DOMContentLoaded', async () => {
    const statusDiv = document.getElementById('connection-status');
    const tbody = document.getElementById('products-tbody');

    try {
        if (typeof supabase === 'undefined') {
            throw new Error('Библиотека Supabase не загружена');
        }

        const { createClient } = supabase;
        const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        const { data, error } = await _supabase
            .from('products')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        statusDiv.textContent = 'Подключение успешно: таблица "products" загружена';
        statusDiv.className = 'status-success';

        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="empty-row">Таблица пуста</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        data.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${Number(product.price).toFixed(2)}</td>
                <td>${product.quantity}</td>
                <td>${product.total !== null ? Number(product.total).toFixed(2) : (product.price * product.quantity).toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Ошибка:', error);
        statusDiv.textContent = 'Ошибка: ' + error.message;
        statusDiv.style.color = '#f85149';
        tbody.innerHTML = `<tr><td colspan="5" class="empty-row" style="color: #f85149;">Ошибка загрузки. Проверьте консоль (F12).</td></tr>`;
    }
});
