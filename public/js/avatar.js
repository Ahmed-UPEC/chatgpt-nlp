var trulience = null;
//var avatarId = "3987971816740702462"; //Default Avatar Id 10 = ECHO_TEST '3987971816740702462' = '10'
var avatarId = "10"; //Default Avatar Id 10 = ECHO_TEST '3987971816740702462' = '10'

pageOnloadHandler = (retry) => {

    authSuccessHandler = (resp) => {
        console.log("Auth succeeded!");
    }
    
    mediaConnectHandler = (resp) => { 
        console.log("Media connected!");
        trulience.setMicEnabled(true);
    }

    mediaDisconnectHandler = (resp) => {
        console.log("Media disconnected!");
    }

    websocketMessageHandler = (resp) => {
        let messageType = resp.messageType;
        if (messageType === window.Trulience.MessageType.ChatText) {
            // Ignore the acknowledgement messages.
            if (resp.status === "MESSAGE_DELIVERED_TO_VPS" || resp.status === "MESSAGE_NOT_DELIVERED_TO_VPS") {
                return;
            }

            if (resp.sttResponse === true) {
                // Received stt message.
                const message = resp.messageArray[0].message;
                console.log("Received STT Message - " + message);
                const chatbox = document.getElementById('chat-input');
                chatbox.value = message;
                // send message
                //document.getElementById('send-btn').click();
                //trulience.sendMessageToVPS("Ok I got it");
            }
        }
    }

    // id of video element to display avatar
    let videoElements = {
        remoteVideo: 'myvideo',
    }
                                                                      
    trulience = Trulience.Builder()
        .setAvatarId(avatarId)
        .setUserName('Guest')
        .enableAvatar(true)
        .setRetry(retry)
        .registerVideoElements(videoElements)
        .build();

    // Register for the events.
    trulience.on('auth-success', authSuccessHandler);
    trulience.on('websocket-message', websocketMessageHandler);
    trulience.on('media-connected', mediaConnectHandler);
    trulience.on('media-disconnect', mediaDisconnectHandler);
    
    // Trigger auth.
    trulience.authenticate();
};



window.onload = () => pageOnloadHandler(false);

window.onunload = function () {
  trulience.disconnectGateway();
};

function startCall() {
  trulience.connectGateway();
}

function endCall(reason) {
  trulience.disconnectGateway(reason);
}

function sendMessageToAvatar(msg) {
  trulience.sendMessageToVPS(msg);
}

