function writingCheck(message) {
    console.log('WebSocket message:', message.users);
    const activeLine = document.getElementById("activeLine");
    let writingUser = "";
    if (message.users.length === 0 || message.type !== "typing") {
        activeLine.innerText = "";
    } else {
        for (let i = 0; i < message.users.length; i++) {
            //if (activeLine.innerText.includes(message.users[i].name)) {

            //} else {
                writingUser += message.users[i].name + ",";
            //}
        }
        if (writingUser !== "") {
            writingUser += " typing now";
            activeLine.innerText = writingUser;
        }    
    }
}