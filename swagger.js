import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'fccMessageBoard',
            description:
                'What I made as part of the FreeCodeCamp Message Board',
            version: '0.0.2',
        },
        servers: [
            {
                url: 'http://localhost:3000/',
                description: 'Local server',
            },
            {
                url: 'https://sl477-boilerplate-project-messageboard.glitch.me/',
                description: 'Live Server',
            },
        ],
    },
    apis: ['./routes/api.js'],
});
