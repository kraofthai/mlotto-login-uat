//index.js 
const models = require("./models")
const Question = models.Question
const Answer = models.Answer
const experss = require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser")
const formidable = require("formidable")
const sharp = require("sharp")
const svgCaptcha =require("svg-captcha")
const session = require("express-session")
const app = experss()

app.set("view engine", "ejs")
app.use(experss.static("public"))
app.use(bodyParser.urlencoded({extended:true}))
app.use("/bootstrap", experss.static(__dirname + "/node_modules/bootstrap/dist"));

app.use(session({
    secret:"workshop-webboard",
    resave:false,
    saveUninitialized:false
}))

app.use("/captcha", (req, res)=>{
    let captcha = svgCaptcha.create({
        size:5, 
        noise:3, 
        background: "#ffa"
    });
    req.session.captcha = captcha.text
    res.type('svg')
    res.status(200)
    res.send(captcha.data)
})

app.get("/", (req, res)=>{ 
    if( req.session.logined ){
        res.render("index")
    }else{
        let rnd = parseInt( Math.random() * 100 ) + 1
        //console.log(req.session.logined || `[${rnd}]not found..`)
        if( rnd !== 2 ){
            res.redirect("/webboard/new-login")    
        }else{
            res.redirect("/webboard/over-transection") 
        } 
    }
    return;
})

app.all("/webboard/new-question", (req, res)=>{
    if( req.method == "GET"){
        res.render("new-question");
        return;        
    }
    let form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        // if( fields.captcha != req.session.captcha ){
        //     res.render("new-question", {
        //         msg:"ใส่อักขระไม่ตรงภาพ",
        //         data:fields
        //     })
        //     return
        // }
    
        let upfile = files.upfile
        let imgFile = upfile.originalFilename
        if( imgFile != "" ){
            const dir = "public/webboard-images/"
            let oldName = imgFile.split(".")
            oldName[0] = new Date().getTime()
            imgFile = oldName.join(".")
            let imgPath = dir + imgFile

            sharp(upfile.filepath).resize( {width:600, withoutEnlargement:true}).toFile(imgPath, err => {});
        }

        let data = {
            question : fields.question,
            detail : fields.detail,
            questioner : fields.questioner,
            date_posted : new Date(),
            num_answers : 0,
            image_file : imgFile
        }
        Question.create(data, (err, doc)=>{
            res.redirect("/webboard/show-all-questions");
        })
    })
})

app.get("/webboard/show-all-questions", ( req, res ) => {
    let q = Question.find().sort("-date_posted")
    let option = { page: req.query.page || 1, limit: 3 }
    Question.paginate(q, option, (err, result) => {
        let links = []
        if( result.page > 1 ){
            links.push(`<a href="${req.path}?page=1">หน้าแรก</a>`)
        }
        if( result.hasPrevPage ){
            links.push(`<a href="${req.path}?page=${result.prevPage}">หน้าที่แล้ว</a>`)
        }
        if( result.hasNextPage ){
            links.push(`<a href="${req.path}?page=${result.nextPage}">หน้าถัดไป</a>`)
        }
        if( result.page < result.totalPage){
            links.push(`<a href="${req.path}"?page=${result.totalPage}>หน้าสุดท้าย</a>`)
        }
        let pageLink = links.join("  -  ")
        res.render("show-all-questions", {
            data:result.docs,
            pageLink:pageLink
        })
    })
})

app.all("/webboard/new-login", (req, res) => {
    if( req.body?.captcha ){
        console.log(`request from : ${req.body?.captcha} || session = ${req.session.captcha}`)
        if( req.body?.captcha != req.session.captcha ){
            res.render("new-login", {
                msg:"ใส่อักขระไม่ตรงภาพ" 
            })
            return
        }
        else if( req.body?.idCard == "admin" && req.body?.password == "aSDDF" ){
            req.session.logined = req.body?.idCard
            res.redirect("/");
            return
        }else{
            res.redirect("/");
            return            
        }
    }else{
        res.render("new-login")        
    } 
})
app.get("/webboard/over-transection", (req, res) => {
    res.render("over-transection", {msg : "มีจำนวนผู้ใช้มากเกินไป" } )
})

app.listen(8080, ()=>console.log("Server started on port:8080"));