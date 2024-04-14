let currentURL = window.location.pathname.slice(3);
currentURL = currentURL.split('/');

const url = '/api/replies/' + currentURL[0];

const threadTitle = document.getElementById('threadTitle');
if (threadTitle) {
    threadTitle.textContent = window.location.pathname;
}

const boardDisplay = document.getElementById('boardDisplay');

fetch(url, {
    data: { thread_id: currentURL[1] },
})
    .then((d) => d.json())
    .then((data) => {
        if (boardDisplay) {
            boardDisplay.innerHTML = `
<div class="thread">
    <div class="main">
        <p class="id">id: ${data.id} (${data.created_on})</p>
        <form id="reportThread">
            <input type="hidden" name="report_id" value="${data._id}">
            <input type="submit" value="Report">
        </form>
        <form id="deleteThread">
            <input type="hidden" value="${data._id}" name="thread_id" required="">
            <input type="text" placeholder="password" name="delete_password" required="">
            <input type="submit" value="Delete">
        </form>
        <h3>${data.text}</h3>
    </div>
    <div class="replies">
        ${data.replies.map((r) => GetReply(r, data)).join('')}
    </div>
    <div class="newReply">
        <form action="/api/replies/${currentURL[0]}/" method="post" id="newReply">
            <input type="hidden" name="thread_id" value="${data._id}">
            <textarea rows="5" cols="80" type="text" placeholder="Quick reply..." name="text" required=""></textarea><br>
            <input type="text" placeholder="password to delete" name="delete_password" required=""><input style="margin-left: 5px" type="submit" value="Submit">
        </form>
    </div>
</div`;

            const reportThread = document.getElementById('reportThread');
            reportThread.addEventListener('submit', (ev) => {
                ev.preventDefault();
                fetch(`/api/threads/${currentURL[0]}`, {
                    method: 'put',
                    body: new FormData(ev.target),
                })
                    .then((d) => d.text())
                    .then((data) => alert(data))
                    .catch((ex) => console.error(ex));
            });

            const deleteThread = document.getElementById('deleteThread');
            deleteThread.addEventListener('submit', (ev) => {
                ev.preventDefault();
                fetch(`/api/threads/${currentURL[0]}`, {
                    method: 'delete',
                    body: new FormData(ev.target),
                })
                    .then((d) => d.text())
                    .then((data) => alert(data))
                    .catch((ex) => console.error(ex));
            });
        }
    })
    .catch((ex) => console.error(ex));

function GetReply(reply, data) {
    return `<div class="reply">
    <p class="id">id: ${reply._id} (${reply.created_on})</p>
    <form id="reportReply" onsubmit="return reportReplyFunc(this)">
        <input type="hidden" name="thread_id" value="${data._id}">
        <input type="hidden" name="reply_id" value="${reply._id}">
        <input type="submit" value="Report">
    </form>
    <form id="deleteReply" onsubmit="return deleteReplyFunc(this)">
        <input type="hidden" value="${data._id}" name="thread_id" required="">
        <input type="hidden" value="${reply._id}" name="reply_id" required="">
        <input type="text" placeholder="password" name="delete_password" required="">
        <input type="submit" value="Delete">
    </form>
    <p>${reply.text}</p>
</div>`;
}

/**
 * @param {SubmitEvent} ev
 */
// eslint-disable-next-line no-unused-vars
function reportReplyFunc(ev) {
    console.log('reportReplyFunc', ev);
    fetch(`/api/replies/${currentURL[0]}`, {
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
function deleteReplyFunc(ev) {
    console.log('deleteReplyFunc', ev);
    fetch(`/api/replies/${currentURL[0]}`, {
        method: 'delete',
        body: new FormData(ev),
    })
        .then((d) => d.text())
        .then((data) => alert(data))
        .catch((ex) => console.error(ex));
    return false;
}
