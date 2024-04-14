const newThread = document.getElementById('newThread');

newThread.addEventListener('submit', () => {
    const board = document.getElementById('board1');
    if (board && board.value) {
        newThread.setAttribute('action', `/api/threads/${board.value}`);
    }
});

const newReply = document.getElementById('newReply');

newReply.addEventListener('submit', () => {
    const board = document.getElementById('board4');
    if (board && board.value) {
        newReply.setAttribute('action', `/api/replies/${board.value}`);
    }
});

const reportThread = document.getElementById('reportThread');

reportThread.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const board = document.getElementById('board2');
    if (board && board.value) {
        const url = `/api/threads/${board.value}`;
        fetch(url, {
            method: 'put',
            body: new FormData(ev.target),
        })
            .then((d) => d.text())
            .then((data) => alert(data))
            .catch((ex) => console.error(ex));
    }
});

const deleteThread = document.getElementById('deleteThread');
deleteThread.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const board = document.getElementById('board3');
    if (board && board.value) {
        const url = `/api/threads/${board.value}`;
        fetch(url, {
            method: 'delete',
            body: new FormData(ev.target),
        })
            .then((d) => d.text())
            .then((data) => alert(data))
            .catch((ex) => console.error(ex));
    }
});

const reportReply = document.getElementById('reportReply');
reportReply.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const board = document.getElementById('board5');
    if (board && board.value) {
        const url = `/api/replies/${board.value}`;
        fetch(url, {
            method: 'put',
            body: new FormData(ev.target),
        })
            .then((d) => d.text())
            .then((data) => alert(data))
            .catch((ex) => console.error(ex));
    }
});

const deleteReply = document.getElementById('deleteReply');
deleteReply.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const board = document.getElementById('board6');
    if (board && board.value) {
        const url = `/api/replies/${board.value}`;
        fetch(url, {
            method: 'delete',
            body: new FormData(ev.target),
        })
            .then((d) => d.text())
            .then((data) => alert(data))
            .catch((ex) => console.error(ex));
    }
});
