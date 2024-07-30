export const getBaseUrl = (request) => {
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || (request.connection && request.connection.encrypted ? 'https' : 'http');
    return `${protocol}://${host}`;
};