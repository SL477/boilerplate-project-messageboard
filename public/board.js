const currentBoard = window.location.pathname.slice(3, -1);
const url = '/api/threads/' + currentBoard;

const boardTitle = document.getElementById('boardTitle');
if (boardTitle) {
    boardTitle.textContent = `Welcome to ${window.location.pathname}`;
}

fetch(url)
    .then((d) => d.json())
    .then((data) => {
        const boardDisplay = document.getElementById('boardDisplay');
        if (boardDisplay) {
            boardDisplay.innerHTML = data
                .map(
                    (ele) => `
<div class="thread">
    <div class="main">
        <p class="id">id: ${ele._id} (${ele.created_on})</p>
        <form id="reportThread" onsubmit="return reportThreadFunc(this)">
            <input type="hidden" name="report_id" value="${ele._id}">
            <input type="submit" value="Report">
        </form>
        <form id="deleteThread" onsubmit="return deleteThreadFunc(this)">
            <input type="hidden" value="${ele._id}" name="thread_id" required="">
            <input type="text" placeholder="password" name="delete_password" required="">
            <input type="submit" value="Delete">
        </form>
        <h3>${ele.text}</h3>
    </div>
    <div class="replies">
        <h5>${ele.replycount} replies total (${ele.replycount - 3 < 1 ? ele.replycount - 3 : 0})- <a href="${window.location.pathname + ele._id}">See the full thread here</a>.</h5>
        ${ele.replies.map((r) => GetReply(r, ele)).join('')}
    </div>
    <div class="newReply">
        <form action="/api/replies/${currentBoard}/" method="post" id="newReply">
            <input type="hidden" name="thread_id" value="${ele._id}">
            <textarea rows="5" cols="80" type="text" placeholder="Quick reply..." name="text" required=""></textarea><br>
            <input type="text" placeholder="password to delete" name="delete_password" required="">
            <input style="margin-left: 5px" type="submit" value="Submit">
        </form>
    </div>
</div>`
                )
                .join('');
        }
    })
    .catch((ex) => console.error(ex));

function GetReply(reply, ele) {
    return `<div class="reply">
    <p class="id">id: ${reply._id} (${reply.created_on})</p>
    <form id="reportReply" onsubmit="return reportReplyFunc(this)">
        <input type="hidden" name="thread_id" value="${ele._id}">
        <input type="hidden" name="reply_id" value="${reply._id}">
        <input type="submit" value="Report">
    </form>
    <form id="deleteReply" onsubmit="return deleteReplyFunc(this)">
        <input type="hidden" value="${ele._id}" name="thread_id" required="">
        <input type="hidden" value="${reply._id}" name="reply_id" required="">
        <input type="text" placeholder="password" name="delete_password" required="">
        <input type="submit" value="Delete">
    </form>
    <p>${reply.text}</p>
</div>`;
}

/**
 * @param {HTMLFormElement} ev
 */
// eslint-disable-next-line no-unused-vars
function reportThreadFunc(ev) {
    fetch(url, {
        method: 'put',
        body: new FormData(ev),
    })
        .then((d) => d.text())
        .then((data) => alert(data))
        .catch((ex) => console.error(ex));
    return false;
}

/**
 * @param {HTMLFormElement} ev
 */
// eslint-disable-next-line no-unused-vars
function reportReplyFunc(ev) {
    fetch(`/api/replies/${currentBoard}`, {
        method: 'put',
        body: new FormData(ev),
    })
        .then((d) => d.text())
        .then((data) => alert(data))
        .catch((ex) => console.error(ex));
    return false;
}

/**
 * @param {HTMLFormElement} ev
 */
// eslint-disable-next-line no-unused-vars
function deleteThreadFunc(ev) {
    fetch(url, {
        method: 'delete',
        body: new FormData(ev),
    })
        .then((d) => d.text())
        .then((data) => alert(data))
        .catch((ex) => console.error(ex));
    return false;
}

/**
 * @param {HTMLFormElement} ev
 */
// eslint-disable-next-line no-unused-vars
function deleteReplyFunc(ev) {
    fetch(`/api/replies/${currentBoard}`, {
        method: 'delete',
        body: new FormData(ev),
    })
        .then((d) => d.text())
        .then((data) => alert(data))
        .catch((ex) => console.error(ex));
    return false;
}
