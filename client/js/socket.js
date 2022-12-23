let socket = io();

socket.on("connect", () => {
    console.log('Connected to server');
});

socket.on("newMsg", (msg) => {
    console.log("New msg : ", msg)
});

socket.emit("createNewMsg", {
    from: "Abed (client)",
    text: "Hello world from client"
}, (callbackMessage) => {
    console.log("Got it : ", callbackMessage)
})

socket.on("disconnect", () => {
    console.log("Disconnect from server");
});