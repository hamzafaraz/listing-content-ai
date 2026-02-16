const https = require('https');
const fs = require('fs');
const path = require('path');

// Load env specific file
const envPath = path.resolve(__dirname, '../.env.local');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/ANTHROPIC_API_KEY=(sk-ant-[a-zA-Z0-9_\-]+)/);
    if (match) {
        apiKey = match[1];
        console.log('Found API Key ending in:', apiKey.slice(-4));
    } else {
        console.error('API Key not found in .env.local');
        process.exit(1);
    }
} catch (err) {
    console.error('Error reading .env.local:', err.message);
    process.exit(1);
}

const testModel = async (modelName) => {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            model: modelName,
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hello' }]
        });

        const options = {
            hostname: 'api.anthropic.com',
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Length': data.length
            }
        };

        console.log(`Testing model: ${modelName}...`);

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log(`[${modelName}] Status:`, res.statusCode);
                if (res.statusCode !== 200) {
                    console.log(`[${modelName}] Error:`, body);
                } else {
                    console.log(`[${modelName}] Success!`);
                }
                resolve(res.statusCode === 200);
            });
        });

        req.on('error', (error) => {
            console.error('Request Error:', error);
            resolve(false);
        });

        req.write(data);
        req.end();
    });
};

(async () => {
    // 1. Try simple Sonnet (Original)
    await testModel('claude-3-sonnet-20240229');

    // 2. Try Sonnet 3.5 (June)
    await testModel('claude-3-5-sonnet-20240620');

    // 3. Try Sonnet 3.5 (Latest/Oct)
    await testModel('claude-3-5-sonnet-20241022');
})();
