
const http = require('http');
const url = require('url');
const postManager = require('./postManager');

const PORT = 3000;

function parseJsonBody(request, callback) {
    let body = '';

    request.on('data', chunk => {
        body += chunk.toString();
    });

    request.on('end', () => {
        try {
            const data = JSON.parse(body);
            callback(null, data);
        } catch (error) {
            callback(error, null);
        }
    });
}

const server = http.createServer((request, response) => {
    const parsedUrl = url.parse(request.url, true);
    const pathname = parsedUrl.pathname;
    const method = request.method;

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type'
    );
    response.setHeader('Content-Type', 'application/json');

    // Gérer les requêtes OPTIONS (CORS)
    if (method === 'OPTIONS') {
        response.writeHead(204);
        return response.end();
    }

    // GET /api/posts
    if (pathname === '/api/posts' && method === 'GET') {
        postManager.getAllPosts((err, posts) => {
            if (err) {
                response.writeHead(500);
                return response.end(JSON.stringify({
                    error: 'Erreur serveur'
                }));
            }

            response.writeHead(200);
            response.end(JSON.stringify(posts));
        });
    }

    // GET /api/posts/:id
    else if (pathname.match(/^\/api\/posts\/\d+$/) && method === 'GET') {
        const id = pathname.split('/')[3];

        postManager.getPost(id, (err, post) => {
            if (err) {
                response.writeHead(500);
                return response.end(JSON.stringify({
                    error: 'Erreur serveur'
                }));
            }

            if (!post) {
                response.writeHead(404);
                return response.end(JSON.stringify({
                    error: 'Post non trouvé'
                }));
            }

            response.writeHead(200);
            response.end(JSON.stringify(post));
        });
    }

    // POST /api/posts
    else if (pathname === '/api/posts' && method === 'POST') {
        parseJsonBody(request, (err, data) => {
            if (err) {
                response.writeHead(400);
                return response.end(JSON.stringify({
                    error: 'JSON invalide'
                }));
            }

            if (!data.title || !data.body) {
                response.writeHead(400);
                return response.end(JSON.stringify({
                    error: 'Title et body sont obligatoires'
                }));
            }

            postManager.insertPost(data, (err, post) => {
                if (err) {
                    response.writeHead(500);
                    return response.end(JSON.stringify({
                        error: 'Erreur serveur'
                    }));
                }

                response.writeHead(201);
                response.end(JSON.stringify(post));
            });
        });
    }

    // PUT /api/posts/:id
    else if (pathname.match(/^\/api\/posts\/\d+$/) && method === 'PUT') {
        const id = pathname.split('/')[3];

        parseJsonBody(request, (err, data) => {
            if (err) {
                response.writeHead(400);
                return response.end(JSON.stringify({
                    error: 'JSON invalide'
                }));
            }

            postManager.updatePost(id, data, (err, post) => {
                if (err) {
                    response.writeHead(500);
                    return response.end(JSON.stringify({
                        error: 'Erreur serveur'
                    }));
                }

                if (!post) {
                    response.writeHead(404);
                    return response.end(JSON.stringify({
                        error: 'Post non trouvé'
                    }));
                }

                response.writeHead(200);
                response.end(JSON.stringify(post));
            });
        });
    }

    // DELETE /api/posts/:id
    else if (pathname.match(/^\/api\/posts\/\d+$/) && method === 'DELETE') {
        const id = pathname.split('/')[3];

        postManager.deletePost(id, (err, post) => {
            if (err) {
                response.writeHead(500);
                return response.end(JSON.stringify({
                    error: 'Erreur serveur'
                }));
            }

            if (!post) {
                response.writeHead(404);
                return response.end(JSON.stringify({
                    error: 'Post non trouvé'
                }));
            }

            response.writeHead(200);
            response.end(JSON.stringify({
                message: 'Post supprimé avec succès',
                post
            }));
        });
    }

    // Route non trouvée
    else {
        response.writeHead(404);
        response.end(JSON.stringify({
            error: 'Route non trouvée'
        }));
    }
});

server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
