enum HttpMethod {
    GET,
    POST,
    PUT,
    HEAD,
    DELETE,
    PATCH,
    OPTIONS,
    CONNECT,
    TRACE
}

enum Newline {
    CRLF,
    LF,
    CR
}


/**
 * WiFi:bit commands.
 */
//% color=#3452C3 weight=90 icon="\uf1eb" block="WiFi:bit"
namespace WiFiBit {

    function writeToSerial(data: string, waitTime: number): void {
        serial.writeString(data + "\u000D" + "\u000A")
        if (waitTime > 0) {
            basic.pause(waitTime)
        }
    }

    let pauseBaseValue: number = 50

    /**
     * Change HTTP method wait period.
     * @param newPauseBaseValue Base value, eg: 1000
     */
    //% weight=1
    export function changeHttpMethodWaitPeriod(newPauseBaseValue: number): void {
        pauseBaseValue = newPauseBaseValue
    }

    /**
     * Make a serial connection between micro:bit and WiFi:bit.
     */
    //% weight=100
    //% blockId="wfb_connect" block="connect to WiFi:bit"
    export function connectToWiFiBit(): void {
        serial.redirect(
            SerialPin.P16,
            SerialPin.P8,
            BaudRate.BaudRate115200
        )
        basic.pause(100)
        // Restart module:
        writeToSerial("AT+RST", 2000)
        // WIFI mode = Station mode (client):
        writeToSerial("AT+CWMODE=1", 5000)
    }

    /**
     * Connect to WiFi network.
     * @param ssid SSID, eg: "SSID"
     * @param key Key, eg: "key"
     */
    //% weight=99
    //% blockId="wfb_wifi_on" block="connect to WiFi network %ssid, %key"
    export function connectToWiFiNetwork(ssid: string, key: string): void {
        // Connect to AP:
        writeToSerial("AT+CWJAP=\"" + ssid + "\",\"" + key + "\"", 6000)
    }

    /**
     * Disconnect from WiFi network.
     */
    //% weight=98
    //% blockId="wfb_wifi_off" block="disconnect from WiFi network"
    export function disconnectFromWiFiNetwork(): void {
        // Disconnect from AP:
        writeToSerial("AT+CWQAP", 6000)
    }

    /**
     * Execute AT command.
     * @param command AT command, eg: "AT"
     * @param waitTime Wait time after execution, eg: 1000
     */
    //% weight=97
    //% blockId="wfb_at" block="execute AT command %command and then wait %waitTime ms"
    export function executeAtCommand(command: string, waitTime: number): void {
        writeToSerial(command, waitTime)
    }

    /**
     * Execute HTTP method.
     * @param method HTTP method, eg: HttpMethod.GET
     * @param host Host, eg: "google.com"
     * @param port Port, eg: 80
     * @param urlPath Path, eg: "/search?q=something"
     * @param headers Headers
     * @param body Body
     */
    //% weight=96
    //% blockId="wfb_http" block="execute HTTP method %method|host: %host|port: %port|path: %urlPath||headers: %headers|body: %body"
    export function executeHttpMethod(method: HttpMethod, host: string, port: number, urlPath: string, headers?: string, body?: string): void {
        let myMethod: string
        switch (method) {
            case HttpMethod.GET: myMethod = "GET"; break;
            case HttpMethod.POST: myMethod = "POST"; break;
            case HttpMethod.PUT: myMethod = "PUT"; break;
            case HttpMethod.HEAD: myMethod = "HEAD"; break;
            case HttpMethod.DELETE: myMethod = "DELETE"; break;
            case HttpMethod.PATCH: myMethod = "PATCH"; break;
            case HttpMethod.OPTIONS: myMethod = "OPTIONS"; break;
            case HttpMethod.CONNECT: myMethod = "CONNECT"; break;
            case HttpMethod.TRACE: myMethod = "TRACE";
        }
        // Establish TCP connection:
        let data: string = "AT+CIPSTART=\"TCP\",\"" + host + "\"," + port
        writeToSerial(data, pauseBaseValue * 6)
        data = myMethod + " " + urlPath + " HTTP/1.1" + "\u000D" + "\u000A"
            + "Host: " + host + "\u000D" + "\u000A"
        if (headers && headers.length > 0) {
            data += headers + "\u000D" + "\u000A"
        }
        if (data && data.length > 0) {
            data += "\u000D" + "\u000A" + body + "\u000D" + "\u000A"
        }
        data += "\u000D" + "\u000A"
        // Send data:
        writeToSerial("AT+CIPSEND=" + (data.length + 2), pauseBaseValue * 3)
        writeToSerial(data, pauseBaseValue * 6)
        // Close TCP connection:
        writeToSerial("AT+CIPCLOSE", pauseBaseValue * 3)
    }

    
    /**
     * Line separator. It's used when headers or body are multiline.
     */
    //% weight=91
    //% blockId="wfb_crlf" block="CRLF"
    export function newline(): string {
        return "\u000D" + "\u000A"
    }

}
