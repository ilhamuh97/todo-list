const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const {Schema} = mongoose;
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect(process.env.DB);

//create item schema
const itemSchema = new Schema({
    name:{
        type:String,
        required:[true, "Need to assign the name!"]
    },
    checked:{
        type:Boolean,
        default:false
    },
    date:{
        type:String,
        default:date.getDate(new Date())
    }
});

//create list schema
const listSchema = new Schema({
    name:{
        type:String,
        required:[true, "Need to assign the name!"]
    },
    items:[itemSchema]
});

//create models
const List = mongoose.model("List", listSchema);
const Item = mongoose.model("Item", itemSchema);

//remove all items except today's items
Item.deleteMany({
    date: {
        $nin: [date.getDate(new Date())]
    }
}, (err)=> {
    if (err) {
        console.error(err)
    }
})

app.get("/", (req, res)=>{
    //show only today's items
    Item.find({date:date.getDate(new Date())}, (err, items)=>{
        if(err){
            console.error(err)
        }else{
            res.render('list', {
                listTitle:date.getDate(),
                toDoList:items
            });
        }
    });
});

app.get("/:customListName", (req, res)=>{
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name:customListName}, (err, foundList)=>{
        if(!err){
            if(!foundList){
                const list = new List({
                    name:customListName,
                    items:[]
                });
                list.save();
                res.redirect('/' + customListName);
            }else{
                res.render('list', {
                    listTitle:customListName,
                    toDoList:foundList.items
                });
            }
        }
    })
});

app.post("/check", (req, res)=>{
    const listName = req.body.listName;
    Item.findOne({_id:req.body.checkbox}, {_id:1, checked:1}, (err, item)=>{
        if(!err){
            if(item){
                Item.updateOne({_id:item._id}, {checked:!item.checked}, (err)=>{
                    res.redirect("/");
                });
            }else{
                List.findOne({name:listName, 'items._id':req.body.checkbox}, (err, list)=>{
                    if(list){
                        list.items.map((item)=>{
                            if(item._id==req.body.checkbox){
                                List.updateOne({
                                    name:listName,
                                    'items._id':req.body.checkbox
                                },{ $set: {
                                        "items.$.checked" : !item.checked }
                                }, (err)=>{
                                    if(!err){
                                        res.redirect('/' + listName)
                                    }
                                })
                            }
                        })
                    }
                })

            }
        }else{
            console.log(err)
        }
    })
});

app.post("/", (req, res)=>{
    //find lists collection by list value from submit button
    List.findOne({name:req.body.list}, (err, foundList)=>{
        if(!err){
            if(foundList){
                //update items inside items array of lists collection
                const foundListItems = foundList.items;
                const newItem = new Item({
                    name:req.body.newToDo
                });
                foundListItems.push(newItem);
                List.updateOne({name:req.body.list}, {items:foundListItems}, (err, foundList)=>{
                    if(!err){
                        res.redirect("/" + req.body.list)
                    }
                });
            }else{
                //create a new item in default items
                const newItem = new Item({
                    name:req.body.newToDo
                });
                newItem.save((err)=>{
                    if(err){
                        console.error(err)
                    }else{
                        console.log("Save completed!")
                    }
                })
                res.redirect('/');
            }
        }
    })
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log("Server started on port: " + port);
});