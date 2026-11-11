
const https = require('https');
const fs = require('fs');

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

function fetchPosts() {
    https.get(API_URL, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            try {
                const posts = JSON.parse(data);
                savePosts(posts);
            } catch (error) {
                console.error('Erreur JSON:', error.message);
            }
        });

    }).on('error', (error) => {
        console.error('Erreur réseau:', error.message);
    });
}

function savePosts(posts) {
    fs.writeFile(
        'posts.json',
        JSON.stringify(posts, null, 2),
        (error) => {
            if (error) {
                console.error('Erreur sauvegarde:', error.message);
            } else {
                console.log('Posts sauvegardés avec succès !');
            }
        }
    );
}

fetchPosts();
