//models.js 
const mongoose = require("mongoose")
const pagination = require("mongoose-paginate-v2")

mongoose.connect('mongodb://localhost:27017/workshop20',{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).catch( err => console.log(err))

const questionSchema = new mongoose.Schema({
    question:{type:String, require:true },
    detail:{type:String},
    questioner:{type:String, require:true},
    data_posted:{type:Date, default: new Date()},
    num_answers:{type:Number},
    immaage_file:{type:String}
})

const answerSchema = new mongoose.Schema({
    question_id:{type:mongoose.Types.ObjectId},
    answer:{type:String},
    answerer:{type:String},
    date_posted:{type:Date, default:new Date()}
})

mongoose.plugin(pagination)
module.exports.Question = mongoose.model('Question', questionSchema)
module.exports.Answer = mongoose.model('Answer', answerSchema)