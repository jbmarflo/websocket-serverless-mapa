class Connection {
    constructor () {
        this.websocket = undefined
        this.locations = []
        this.messages = []
    }

    connect () {
        const websocket = this.websocket = new WebSocket('wss://e4rx49n4n1.execute-api.us-east-1.amazonaws.com/dev');
        websocket.onclose = ({ wasClean, code, reason }) => {
            this.messages.push(
                `onclose:   ${JSON.stringify({ wasClean, code, reason })}`);
        };
        websocket.onerror = error => {
            console.log(error);
            this.messages.push(
                'onerror:  Ah ocurrido un error, ver consola'
            );
        };
        websocket.onmessage = ({ data }) => {
            this.locations.push(`onmessage: ${data}`);
            this.messages.push(`onmessage: ${data}`);
        };
        websocket.onopen = () => {
            this.messages.push('onopen: Coneccion exitosa.');
        };
        console.log(this.messages)
        console.log(this.locations)
    }

    send (lat, lng, description) {
        this.messages.push('client: Enviando mensaje.');
        this.websocket.send(
            JSON.stringify({ action: 'default', data: {
                    lat: lat,
                    lng: lng,
                    description: description
                }
            })
        );

    }

    disconnect() {
        // WebSocket sends a message to API Gateway that gets routed to the
        // '$disconnect' route.
        this.messages.push('client:    Closing the connection.');
        this.websocket.close();
    }

    run () {
        this.connect()
        this.websocket.onmessage = function ({ data }) {
            console.log(JSON.parse(event.data));
        }
    }
}