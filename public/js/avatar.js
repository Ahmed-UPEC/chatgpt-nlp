var trulience = null;
var avatarId = '10'; //Default Avatar Id 10 = ECHO_TEST

pageOnloadHandler = (retry) => {

// call back after authentication and ready to connect 
authenticated = (resp) => {
    // autoconnect
    // trulience.connectGateway()
}

connected = (resp) => {
    document.getElementById("connect").disabled = true;
    document.getElementById("disconnect").disabled = false;
    document.getElementById("send").disabled = false;
}

disconnected = (resp) => {
    document.getElementById("connect").disabled = false;
    document.getElementById("disconnect").disabled = true;
    document.getElementById("send").disabled = true;
}

handleMessage = (resp) => {
    let messageType = resp.messageType;
    if (messageType === window.Trulience.MessageType.ChatText) {

    // Ignore the acknowledgement messages.
        if (resp.status === "MESSAGE_DELIVERED_TO_VPS" || resp.status === "MESSAGE_NOT_DELIVERED_TO_VPS") {
        return;
            }

        if (resp.sttResponse === true) {
    // Received stt message.
        console.log("Received STT Message - " + resp.messageArray[0].message);
            }
}
}

// Trulience authentication callbacks
    let authEvents = {
        onReady: authenticated,
onFail: null,
    }

// Trulience websocket callbacks
    let wsEvents = {
        onOpen: null,
        onConnectFail: null,
        onMessage: handleMessage,
        onWarn: null,
        onError: null,
        onClose: null,
    }

// Trulience media event callbacks
    let mediaEvents = {
        onConnected: connected,
        onWaiting: null,
        onBusy: null,
        onConnecting: null,
        onDisconnect: disconnected,
        micStatus: null
    }

// id of video element to display avatar
    let videoElements = {
        remoteVideo: 'myvideo',
    }

    //if avatar has oauth enabled then it will be checked on sdk load
                                                                                    
trulience = Trulience.Builder()
        .setAvatarId(avatarId) // Setting as String as Long values are truncated in JavaScript
        .setLanguagePreference('en-US')
        .setUserName('Guest')
        .enableAvatar(true)  // false for chat only, true for chat and video avatar
        .setAuthCallbacks(authEvents)
        .setWebSocketCallbacks(wsEvents)
        .setMediaCallbacks(mediaEvents)
        .setRetry(retry)
        .registerVideoElements(videoElements)
        .build();

    trulience.authenticate();
};

window.onload = () => pageOnloadHandler(false);

window.onunload = function () {
    trulience.disconnectGateway();
}

function startCall() {
    trulience.connectGateway();
}

function endCall(reason) {
    trulience.disconnectGateway(reason);
}

function sendMessageToAvatar(msg) {
    trulience.sendMessageToVPS(msg);
}