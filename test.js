var request = require("request");
var express = require('express');
var lsm = require('@line/bot-sdk');
var httpport = 5555;
var app = express();
var router = express.Router();
var lineConfig = {
	channelAccessToken:'c3rDT3bkhmht0qKe9QDMDNOpzQQxduE6/Wt8rYsPAcd+rHCV0kkmdCdbx6pyKMoW2VuhpIe1jybYaoASQtkGsJhWMmXe4BeQMLhk7dp7jkVbnSAXTbOCRk98DHBFc6DSkZm7TtsMjvKQGifoHiNFqgdB04t89/1O/w1cDnyilFU=',
	channelSecret:'dc80021dbe1136163668265a97d5b20e'
};
var userList = [];
var groupList = [];

var initList =function (){
	userList.push('Uc82849d5b1fad23dd0020f702b35b780');
	groupList.push('C1c4cec9b20858fa4c67d83eef7f4f33d');
};

initList();

router.get("/test/:id/:data",function(req, res, next){
	var id = (req.params.id==='aaa')?"Uc82849d5b1fad23dd0020f702b35b780":req.params.id;
	//console.log(id);
	var data = req.params.data||"test";
	var botAccessKey = 'c3rDT3bkhmht0qKe9QDMDNOpzQQxduE6/Wt8rYsPAcd+rHCV0kkmdCdbx6pyKMoW2VuhpIe1jybYaoASQtkGsJhWMmXe4BeQMLhk7dp7jkVbnSAXTbOCRk98DHBFc6DSkZm7TtsMjvKQGifoHiNFqgdB04t89/1O/w1cDnyilFU=';
	request({
		headers :{
			'Content-Type': 'application/json; charset=UTF-8',
			'Authorization':'Bearer {'+botAccessKey+'}'
		},
		url:"https://api.line.me/v2/bot/message/push",
		method:"POST",
		json : {
			to : id,
			messages:[{
				type:"text",
				text:data
			}]
		}
	},function(err, response, body){
		var result = "";
		//console.log("error:"+JSON.stringify(err));
		result = "error:<br>"+JSON.stringify(err);
		//console.log("response:"+JSON.stringify(response));
		result = result + "<br>response:<br>"+JSON.stringify(response);
		//console.log("body:"+JSON.stringify(body));
		result = result + "<br>body:<br>"+JSON.stringify(body);
		res.send(result);
	});
});
function removeData(typedata, id){
	var resultData = [];
	if (typedata === 'user'){
		resultData = userList;
	} else if (typedata === 'group'){
		resultData = groupList;
	}
	for (var i=0;i<resultData.length;i++){
		if (resultData[i]===id){
			resultData.splice(i,1);
			brek;
		}
	}
	if (typedata === 'user'){
		userList = resultData;
	} else if (typedata === 'group'){
		groupList = resultData;
	}
}
router.post('/webhook', lsm.middleware(lineConfig), function(req, res){
	req.body.events.map(function(eventData){
		console.log(JSON.stringify(eventData));
		//for group
		if (eventData.type==='join'){
			if (eventData.source.groupId){
				groupList.push(eventData.source.groupId);
			} else if (eventData.source.roomId){
				groupList.push(eventData.source.roomId);
			}
		} else if (eventData.type==='leave'){
			if (eventData.source.groupId){
				removeData('group',eventData.source.groupId);
			} else if(eventData.source.roomId){
				removeData('group',eventData.source.roomId);
			}
		} else if (eventData.type==='follow'){
			userList.push(eventData.source.userId);
		} else if (eventData.type==='unfollow'){
			removeData('user',eventData.source.userId);
		}
		//if (eventData.type ==='message'){
			//console.log(JSON.stringify(eventData));
		//}
	});
});
router.get('/getUserList', function(req, res){
	var resultData = {
		dataSize : userList.length,
		datas : userList
	};
	res.send(JSON.stringify(resultData));
});
router.get('/getGroupList', function(req, res){
	var resultData = {
		dataSize : groupList.length,
		datas : groupList
	};
	res.send(JSON.stringify(resultData));
});
app.use("/",router);
app.listen(process.env.PORT || httpport);
