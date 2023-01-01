let socket = io();

function scrollToBottom() {
    let messages = document.querySelector('#message-content').lastElementChild
    messages.scrollIntoView();
}

socket.on("connect", () => {
    scrollToBottom()
    const searchQuery = window.location.search.substring(1);
    let params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g, '').replace(/=/g, '":"') + '"}');
    socket.emit('join', params, function (error) {
        if (error) {
            alert(error);
            window.location.href = '/';
        }
    })
});

socket.on("newMsg", (msg) => {
    const template = $('#message-temp').html();
    const formattedTime = moment(msg.createdAt).format('LT');
    const html = Mustache.render(template, {
        from: msg.from,
        text: msg.text,
        createdAt: formattedTime
    });
    $('#message-content').append(html);
    scrollToBottom()
});

socket.on("newLocationMsg", (msg) => {
    const template = $('#location-message-temp').html();
    const formattedTime = moment(msg.createdAt).format('LT');
    const html = Mustache.render(template, {
        from: msg.from,
        url: msg.url,
        createdAt: formattedTime
    });
    $('#message-content').append(html)
    scrollToBottom()
});

socket.on('updateUsersList', (users) => {
    $('#chat-list').html('');
    users.forEach((user) => {
        const template = $('#user-box-temp').html();
        const html = Mustache.render(template, {
            name: user
        });
        $('#chat-list').append(html);
    })
})

socket.on("disconnect", () => {
    console.log("Disconnect from server");
});

$(document).on('click', '#message-btn', function (e) {
    e.preventDefault();
    socket.emit("createNewMsg", {
        from: "Abed (client)",
        text: $('#message-input').val(),
        createdAt: (new Date()).toLocaleTimeString().replace(/(.*)\D\d+/, '$1')
    }, (callbackMessage) => {
        console.log("Got it : ", callbackMessage)
    });
    $('#message-input').val('');
});

$(document).on('click', '#location-btn', function (e) {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser.");
    }

    navigator.geolocation.getCurrentPosition(function (position) {
        socket.emit('createLocationMsg', {
            from: "Abed (client)",
            lat: position.coords.latitude,
            long: position.coords.longitude,
        })
    }, function () {
        return alert("Unable to fetch your location.");
    })
});