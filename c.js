(function(username,conf){
	conf = conf || {};
	let rid = conf.room || 1;
	let token = conf.token || 'GR1sCo3hJzXkrRSACZoyH4';
	let showPic = conf.showPic===undefined?true:conf.showPic;
	let socket = new WebSocket(`wss://connect.websocket.in/mwr_chat?room_id=${rid}`);
	function appendMsg(msg, pos) {
		let content = "";
		switch (msg.type) {
			case "image":
				if(showPic){
					console.log(`%c${msg.username}%c:`,(pos=='left')?"color:blue":"color:green","color:black");
					console.log("%c ", "padding:50px 50px;background: url(" + msg.content + "); background-size: 100px auto; color: transparent;background-repeat:no-repeat");
					return;
				}else{
					content = "[图片]";
				}
				break;
			default:
				content = msg.content;
				break;
		}
		console.log(`%c${msg.username}%c:${content}`,(pos=='left')?"color:blue":"color:green","color:black")
	}
	socket.onmessage = function (e) {
		let msg = JSON.parse(e.data);
		appendMsg(msg, "left");
	};
	fetch("https://kvdb.io/" + token + "/?regex=%5Emsg_&format=json&values=true")
		.then(r => r.json()).then(r => {
		let index = 0;
		r.forEach(i => {
			let data = JSON.parse(i[1]);
			appendMsg({
				username: data.username,
				content: data.content,
				type: data.type
			}, data.username === username ? 'right' : 'left');
		});
	});
	return {
		send: function (content, type) {
			let msg = {
				username: username,
				content: content,
				type: type || 'text',
				timestamp: new Date().getTime()
			};
			appendMsg(msg, "right");
			socket.send(JSON.stringify(msg));
			fetch("https://kvdb.io/" + token + "/msg_" + msg.timestamp, {
				'method': 'POST', 'body': JSON.stringify(msg)
			}).then(r => {

			});
			return '';
		}
	}
})