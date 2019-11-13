const AWS = require('aws-sdk');
const apig = new AWS.ApiGatewayManagementApi({
    endpoint: process.env.APIG_ENDPOINT
});
const dynamodb = new AWS.DynamoDB.DocumentClient();

const connectionTable = process.env.CONNECTIONS_TABLE;

exports.handler = async function(event, context) {

    const { body, requestContext: { connectionId, routeKey }} = event;
    switch(routeKey) {
        case '$connect':
            await dynamodb.put({
                TableName: connectionTable,
                Item: {
                    connectionId,
                    // Expira la conección en un hora. Es opcional, pero recomendable.
                    ttl: parseInt((Date.now() / 1000) + 3600)
                }
            }).promise();
            break;

        case '$disconnect':
            await dynamodb.delete({
                TableName: connectionTable,
                Key: { connectionId }
            }).promise();
            break;

        case 'routeA':
            await apig.postToConnection({
                ConnectionId: connectionId,
                Data: body
            }).promise();
            break;

        case '$default':
        default:
            const data = await dynamodb.scan({
                TableName: connectionTable,
            }).promise();
            console.log('data data')
            console.log(data)
            data.Items.map(async (connection) => {
                console.log(connection)
                await apig.postToConnection({
                    ConnectionId: connection.connectionId,
                    Data: body
                })
            })
    }

    return { statusCode: 200 };
}