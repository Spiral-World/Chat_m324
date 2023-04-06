function writingCheck(message) {
    console.log('WebSocket message:', message.users);
    const activeLine = document.getElementById("activeLine");
    let writingUser = "";
    if (message.type !== "typing" || message.users.length === 0) {
        activeLine.innerText = "";
    } else {
        for (let i = 0; i < message.users.length; i++) {
                writingUser += message.users[i].name + ",";
        }
        if (writingUser !== "") {
            writingUser += " typing now";
            activeLine.innerText = writingUser;
        }    
    }
}